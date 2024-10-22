from openai import OpenAI

client = OpenAI(
    api_key="ollama",
    base_url="http://localhost:8000/v1",
    default_headers={ "x-openai-base-url": "http://localhost:11434/v1" }
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="qwen:4b",
    stream=False,
)
print(chat_completion.choices[0].message.content)
