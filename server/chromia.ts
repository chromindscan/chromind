import {
  createClient,
  newSignatureProvider,
  IClient,
} from "postchain-client";

let chromiaClient: IClient;
const signatureProvider = newSignatureProvider({
  privKey: process.env.CHROMIA_PRIVATE_KEY!,
});

const initClient = async () => {
  if (chromiaClient) {
    return chromiaClient;
  }

  chromiaClient = await createClient({
    directoryNodeUrlPool: ["https://dapps0.chromaway.com:7740"],
    blockchainRid: "E55CAEA35948B8FA13F9E19B201D5A93BAA664AD57E6CE52AE9022B5024B8083",
  });
  return chromiaClient;
};

interface OpenAILog {
  chat_id: string;
  base_url: string;
  request_model: string;
  request_messages: string; // json
  user_question: string;
  request_raw: string; // json
  response_object: string;
  response_created: number;
  response_model: string;
  response_system_fingerprint: string;
  response_provider: string;
  response_usage_prompt_tokens: number;
  response_usage_completion_tokens: number;
  response_usage_total_tokens: number;
  assistant_reply: string;
  finish_reason: string;
  response_raw: string;
}

export async function addLog({
  chat_id,
  base_url,
  request_model,
  request_messages,
  user_question,
  request_raw,
  response_object,
  response_created,
  response_model,
  response_system_fingerprint,
  response_provider,
  response_usage_prompt_tokens,
  response_usage_completion_tokens,
  response_usage_total_tokens,
  assistant_reply,
  finish_reason,
  response_raw,
}: OpenAILog) {
  const client = await initClient();
  await client.signAndSendUniqueTransaction(
    {
      name: "add_log",
      args: [
        chat_id,
        base_url,
        request_model,
        request_messages,
        user_question,
        request_raw,
        response_object,
        response_created,
        response_model,
        response_system_fingerprint,
        response_provider,
        response_usage_prompt_tokens,
        response_usage_completion_tokens,
        response_usage_total_tokens,
        assistant_reply,
        finish_reason,
        response_raw,
      ],
    },
    signatureProvider
  );
}
