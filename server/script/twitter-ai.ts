import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { ZepClient } from '@getzep/zep-cloud';
import { SYSTEM_PROMPT } from "./prompt";

// Setup xAI
const openai = new OpenAI({ 
    apiKey: process.env.XAI_API_KEY,
    baseURL: "http://localhost:8000/v1" ,
    defaultHeaders: {
        "x-openai-base-url": "https://api.x.ai/v1"
    }
});

const model = "grok-beta";
const id = "3";
const zepClient = new ZepClient({
    apiKey: process.env.ZEP_API_KEY!,
});

async function processAI() {
    const memories = await zepClient.memory.get(id)
    const formattedMemories: any[] = memories.messages?.map(msg => ({
        role: "assistant", 
        content: msg.content,
    })) || [];
    const result = await openai.chat.completions.create({
        temperature: 1,
        model,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT(
                    new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" })
                )
            },
            ...formattedMemories
        ]
    })
    const answer = result.choices[0].message;
    await sendTweet(answer.content || "");
    await zepClient.memory.add(id, {messages: [{
        roleType: "assistant",
        content: answer.content || ""
    }]});

}


import { TwitterApi } from 'twitter-api-v2';
const {
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
} = process.env;

const twitterClient = new TwitterApi(
    {
        appKey: TWITTER_API_KEY!,
        appSecret: TWITTER_API_SECRET!,
        accessToken: TWITTER_ACCESS_TOKEN,
        accessSecret: TWITTER_ACCESS_SECRET,
    }
);

async function sendTweet(tweet: string) {
    if (tweet.length === 0) {
        throw new Error("Tweet cannot be empty");
    }
    await twitterClient.v2.tweet(tweet);
}

import { CronJob } from 'cron';

const job = new CronJob(
	'0 * * * *',
	function () {
        const randomTimeInAnHour = Math.floor(Math.random() * 60 * 1000);
        setTimeout(processAI, randomTimeInAnHour);
	}, 
	null, 
	true, 
	'America/Los_Angeles' 
);