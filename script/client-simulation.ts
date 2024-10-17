import OpenAI from "https://deno.land/x/openai@v4.67.3/mod.ts";

const openai = new OpenAI({ 
    apiKey: "ollama", 
    baseURL: "http://localhost:8000/v1" ,
    defaultHeaders: {
        "x-openai-base-url": "http://localhost:11434/v1"
    }
});

async function main() {
    const result = await openai.chat.completions.create({
        model: "qwen:4b",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "What is the capital of the United States?" },
        ],
        stream: false,
    });
    console.log(result.choices[0].message.content);
}

main()