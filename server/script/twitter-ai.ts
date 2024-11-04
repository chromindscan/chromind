// src/index.js

import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { ZepClient } from "@getzep/zep-cloud";
import { SYSTEM_PROMPT, TWITTER_PROMPT } from "./prompt";
import { TwitterApi } from "twitter-api-v2";
import { CronJob } from "cron";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "http://localhost:8000/v1",
  defaultHeaders: {
    "x-openai-base-url": "https://api.x.ai/v1",
  },
});

const MODEL = "grok-beta";
const ID = "12";

// Initialize ZepClient
const zepClient = new ZepClient({
  apiKey: process.env.ZEP_API_KEY,
});

// Initialize Twitter Client
const {
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET,
} = process.env;

const twitterClient = new TwitterApi({
  appKey: TWITTER_API_KEY!,
  appSecret: TWITTER_API_SECRET!,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET,
});

async function getTwitterMentions() {
  try {
    const response = await fetch("https://api.elfa.ai/v1/mentions?limit=15&offset=0", {
      headers: {
        "x-elfa-api-key": process.env.ELFA_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`ELFA API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Twitter mentions:", error);
    return null;
  }
}

// Utility function to fetch Chromaway price
async function getChrPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=chromaway&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
    );

    if (!response.ok) {
      throw new Error(`Coingecko API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Chromaway price:", error);
    return null; // Return null or a default value if fetching fails
  }
}

// Retry utility with exponential backoff
async function retryOperation(operation: () => Promise<any>, retries = 3, delay = 1000) {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    console.warn(`Operation failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

// Function to send a tweet with retries
async function sendTweet(priceData: string, twitterData: string, content: string) {
  if (!content || content.trim().length === 0) {
    throw new Error("Tweet content cannot be empty.");
  }

  try {
    // Generate tweet using OpenAI
    const aiResult = await retryOperation(() =>
      openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: TWITTER_PROMPT(priceData, twitterData, content),
          },
        ],
      })
    );

    if (
      !aiResult ||
      !aiResult.choices ||
      !aiResult.choices[0] ||
      !aiResult.choices[0].message ||
      !aiResult.choices[0].message.content
    ) {
      throw new Error("Invalid response structure from OpenAI.");
    }

    const aiMessage = aiResult.choices[0].message.content;
    const tweetContent = aiMessage.match(/<tweet>(.*?)<\/tweet>/s)?.[1] || '';
    console.log("Generated tweet:", tweetContent);
    const quoteTweetContent = aiMessage.match(/<quote_tweet>(.*?)<\/quote_tweet>/s)?.[1].trim() || '';
    console.log("Generated quote tweet:", JSON.stringify(quoteTweetContent));

    if (tweetContent.length === 0) {
      throw new Error("Generated tweet content is empty.");
    }

    // Post the main tweet
    const mainTweet = await retryOperation(() => twitterClient.v2.tweet(tweetContent, quoteTweetContent !== "" ? {
      quote_tweet_id: quoteTweetContent.split("/").pop().trim(),
    } : {}));
    console.log("Tweeted:", tweetContent);

    // Post the reply tweet with proof link
    const proofLink = `https://chr-llm-demo.surge.sh/log/${aiResult.model}-${aiResult.id}`;
    const replyTweet = await retryOperation(() =>
      twitterClient.v2.tweet({
        reply: {
          in_reply_to_tweet_id: mainTweet.data.id,
        },
        text: `Proof of AI: ${proofLink}`,
      })
    );

    console.log("Replied with proof link:", proofLink);

    return tweetContent;
  } catch (error) {
    console.error("Error in sendTweet:", error);
    throw error; // Rethrow to allow upstream handling
  }
}

// Function to process AI and handle tweeting
async function processAI() {
  try {
    const memories = await zepClient.memory.get(ID);
    const formattedMemories =
      memories.messages?.map((msg) => ({
        role: msg.role || "assistant",
        content: msg.content,
      })) || [] as any[];

    const chrPrice = await getChrPrice() as any;
    if (!chrPrice) {
      console.warn("Skipping AI processing due to missing Chromaway price.");
      return;
    }
  const twitterData = await getTwitterMentions() as any;
    if (!twitterData) {
      console.warn("Skipping AI processing due to missing Twitter mentions.");
      return;
    }

    const systemPrompt = SYSTEM_PROMPT(JSON.stringify(chrPrice));

    // Generate AI response
    const aiResponse = await retryOperation(() =>
      openai.chat.completions.create({
        temperature: 0.6,
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...formattedMemories,
        ],
      })
    );

    if (
      !aiResponse ||
      !aiResponse.choices ||
      !aiResponse.choices[0] ||
      !aiResponse.choices[0].message ||
      !aiResponse.choices[0].message.content
    ) {
      throw new Error("Invalid response structure from OpenAI.");
    }

    const answer = aiResponse.choices[0].message.content.trim();
    console.log("AI Answer:", answer);

    // Send tweet with AI answer
    let mainTweetContent;
    try {
      mainTweetContent = await sendTweet(
        `CHR Price: $${chrPrice.chromaway.usd}\n24h Price Change: ${chrPrice.chromaway.usd_24h_change}%`, 
        twitterData.data.map(
          (d: any) => `---
Link: https://x.com${d.originalUrl}
Content: ${d.content}
likes: ${d.likeCount}
quote: ${d.quoteCount}
reply: ${d.replyCount}
repost: ${d.repostCount}
view: ${d.viewCount}
bookmark: ${d.bookmarkCount}
Author: ${d.account.username}
Author Location: ${d.account.location}
Author Description: ${d.account.description}
Author Followers: ${d.account.followerCount}
---`
        ).join("\n\n"),
        answer);
    } catch (tweetError) {
      console.error("Failed to send tweet. Skipping memory update.");
      return; // Exit early if tweeting fails
    }

    // Update ZepClient memory
    await zepClient.memory.add(ID, {
      messages: [
        {
          roleType: "user",
          content: mainTweetContent,
        },
      ],
    });
  } catch (error) {
    console.error("Error in processAI:", error);
    // Optionally, implement further error handling or notifications
  }
}

// Initialize Cron Job to run processAI at random times every hour
const job = new CronJob(
  "0 * * * *",
  () => {
    const randomDelay = Math.floor(Math.random() * 60 * 60 * 1000); // Random delay up to 1 hour
    console.log(`Scheduling processAI to run in ${randomDelay}ms`);
    setTimeout(processAI, randomDelay);
  },
  null,
  true,
  "America/Los_Angeles"
);

// Start the Cron Job
job.start();
console.log("Cron Job started.");

// Initial run
processAI();