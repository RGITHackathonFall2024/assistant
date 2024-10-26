// playground for testing apis

import { AIContextManager } from "../src/ai";
import Groq from 'groq-sdk';
import "dotenv/config";
import { apiTools } from "../src/apis";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions.mjs";

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

const ai = new AIContextManager(client, apiTools, "llama3-70b-8192");
let env_info = {
    current_date: new Date().toLocaleDateString("ru")
};
let user_info = {
    name: "Дмитрий",
    location: "Ростов-на-Дону, Ростовская Область, Россия"
};
let hello = { role: "assistant", content: JSON.stringify({follow_up: false, response: [{type: "text", text: `Здравствуй ${user_info.name}, я Ранчер твой помощник от банка Центр-Инвест.`}]}) } satisfies ChatCompletionMessageParam;
await ai.initialize([hello]);
console.log(await ai.execute({
    type: "user_message",
    content: "Привет, найди ID станции по запросу Ростов.",
    env_info,
    user_info
}))