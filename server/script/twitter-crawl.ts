import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

import * as toughCookie from 'tough-cookie';
import { Scraper, SearchMode } from "agent-twitter-client";
// import { Scraper, SearchMode } from "@the-convocation/twitter-scraper";

const { TWITTER_USERNAME, TWITTER_PASSWORD } = process.env;

const scraper = new Scraper();


async function loginIfNeeded() {
  const cookiesPath = './cookies.json';

  if (fs.existsSync(cookiesPath)) {
    const cookiesData = fs.readFileSync(cookiesPath, 'utf8');
    const cookiesJSON = JSON.parse(cookiesData);
    const cookies = cookiesJSON.reduce((acc: toughCookie.Cookie[], c: any) => {
      const cookie = toughCookie.Cookie.fromJSON(c);
      return cookie ? [...acc, cookie] : acc;
    }, []);
    await scraper.setCookies(cookies);
  }

  const isLoggedIn = await scraper.isLoggedIn();
  if (!isLoggedIn) {
    await scraper.login(TWITTER_USERNAME!, TWITTER_PASSWORD!);
    const cookies = await scraper.getCookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies), 'utf8');
    await scraper.setCookies(cookies);
  }
}

async function getTweetsContainingCHR(count: number) {
  const tweets = await scraper.searchTweets('$CHR', count, SearchMode.Latest);
  return tweets;
}

async function getRepliesToUsername(username: string, count: number) {
  const query = `to:${username}`;
  const tweets = await scraper.searchTweets(query, count, SearchMode.Top);
  return tweets;
}

async function main() {
  await loginIfNeeded();

  // Fetch and display tweets containing $CHR
  const chrTweets = await getTweetsContainingCHR(10);
  console.log('Tweets containing $CHR:', chrTweets);

  // Fetch and display replies to a specific username
  const repliesToUser = await getRepliesToUsername('alphaonchain', 10);
  console.log('Replies to elonmusk:', repliesToUser);
}

main().catch(console.error);