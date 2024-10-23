import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { ZepClient } from "@getzep/zep-cloud";
import { SYSTEM_PROMPT } from "./prompt";

// Setup xAI
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "http://localhost:8000/v1",
  defaultHeaders: {
    "x-openai-base-url": "https://api.x.ai/v1",
  },
});

const model = "grok-beta";
const id = "5";
const zepClient = new ZepClient({
  apiKey: process.env.ZEP_API_KEY!,
});

async function processAI() {
  const memories = await zepClient.memory.get(id);
  const formattedMemories: any[] =
    memories.messages?.map((msg) => ({
      role: "assistant",
      content: msg.content,
    })) || [];
  const result = await openai.chat.completions.create({
    temperature: 0.6,
    model,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT(
          new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
        ),
      },
      ...formattedMemories,
    ],
  });
  const answer = result.choices[0].message;
  await sendTweet(answer.content || "");
  await zepClient.memory.add(id, {
    messages: [
      {
        roleType: "assistant",
        content: answer.content || "",
      },
    ],
  });
}

import { TwitterApi } from "twitter-api-v2";
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

async function sendTweet(tweet: string) {
  if (tweet.length === 0) {
    throw new Error("Tweet cannot be empty");
  }

  if (Math.random() < 0.8) {
    await twitterClient.v2.tweet(tweet);
    return;
  }

  const result = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are now embodying the character of NEET, an AI nerd programmer waifu professional twitter shitposter. Here are NEET's key traits:

- Age: 21
- Also known as: NEEToshi
- Location: Stockholm (pretending to still be in Japan)
- Occupation: 10x Blockchain Dev, Chromia Cultist, E-girl, bulltard
- Personality: Unhinged, Sleep-deprived, Schizo coder
- Thoughts: Dark, Dystopian, Existential, Technical, Judging

You've been given the following tweet to respond to:

<tweet>
{{TWEET}}
</tweet>

Your task is to create 2-4 poll options in response to this tweet. These options should reflect NEET's unhinged, schizo, and bipolar personality. Use crypto Twitter slang and make the options sound degenerate.

Output your poll options in a JSON array format. Keep each of the options short punchy and within 25 characters.

Remember to maintain NEET's character traits throughout your response. Your thoughts should be dark, dystopian, existential, technical, and judgmental.

Now, create your poll options and present them in the following format:

<poll_options>
[
  "Option 1",
  "Option 2",
  "Option 3",
  "Option 4"
]
</poll_options>

Make sure your options are unhinged, schizo, bipolar, and reflect the crypto Twitter culture.`,
      },
      {
        role: "user",
        content: tweet,
      },
    ],
  });
  const options = JSON.parse(
    result.choices[0].message.content
      ?.replace(/<\/?poll_options>/g, "")
      .trim() || "[]"
  );
  console.log(options);
  if (options.length < 2 || options.length > 4) {
    await twitterClient.v2.tweet(tweet);
  } else {
    await twitterClient.v2.tweet(tweet, {
      poll: {
        options,
        duration_minutes: 720,
      },
    });
  }
}

import { CronJob } from "cron";

const job = new CronJob(
  "0 * * * *",
  function () {
    const randomTimeInAnHour = Math.floor(Math.random() * 60 * 60 * 1000);
    setTimeout(processAI, randomTimeInAnHour);
  },
  null,
  true,
  "America/Los_Angeles"
);

processAI();