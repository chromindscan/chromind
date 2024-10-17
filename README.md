# Chromia as a Transparent AI Database

> The code are still in development. Please use it with caution and ensure to update the wallet address before using it in production.

## The Need for Transparency in AI
How do we know if those viral "AI trading" accounts are actually using AI? Most Crypto x AI projects claim to use AI for trading, meme and tweet generation, but provide zero proof. This project solves that by recording all AI interactions on-chain, making them real time and publicly verifiable.

## Introduction

 Chromia as a Transparent AI Database is a web server that logs all AI model interactions (OpenAI, Ollama, OpenRouter) onto Chromia's blockchain, creating a verifiable record of AI activities. Integration requires just 4 lines of code.

To integrate it, simply run the server and update 4-lines of your OpenAI code. It supports OpenAI, Ollama, OpenRouter (I've tested these so far!)
![](./demo.png)

## Documentation


### Requirements
- Chromia CLI Installed
- PostgreSQL installed
- Deno v2


### To run
To start the server
```
deno run -A server/main.ts
```

### Things to do before going production

Current code are still in development, but the proof of concept is working.

TODO:
- [ ] Only allow admin to update the database 
- [ ] Update Private Key in script
- [ ] Simple display UI for transparency
- [ ] Support Streaming