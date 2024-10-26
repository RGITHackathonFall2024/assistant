import Groq from 'groq-sdk';
import "dotenv/config";
import fs from "fs/promises";
import type { FollowUpMessage } from './gen';
import { AIContextManager, type Message, type ToolFunction, type Tools, type UserMessage } from './ai';
import { apiTools } from './apis';

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

let tools: Tools = {
    ...apiTools
}

async function main(request: UserMessage | FollowUpMessage) {
    const ai = new AIContextManager(client, tools, "llama3-70b-8192");

    await ai.initialize(await fs.readFile("assistant-config.md", "utf-8"));
    await ai.execute(request, (message: Message) => {
        console.log(`[APP] got ${message.role} message, ${message.content}`);
    });
}

main({
    type: "user_message",
    content: "Хочу билеты в питер на послезавтра",
    env_info: {
        current_date: new Date().toLocaleDateString("ru")
    },
    user_info: {
        name: "Дмитрий",
        location: "Ростов-на-Дону, Ростовская Область, Россия"
    }
});