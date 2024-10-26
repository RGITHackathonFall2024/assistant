import Groq from 'groq-sdk';
import "dotenv/config";
import fs from "fs/promises";
import type { ChatCompletionCreateParamsNonStreaming } from 'groq-sdk/resources/chat/completions.mjs';
import { generateMockTickets } from './mock';
import type { FollowUpMessage } from './gen';
import { AIContextManager, type UserMessage } from './ai';

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

let tools: Record<string, (data: any) => Promise<any>> = {
    "rzd.getTicketPrices": async (data: any) => {
        let query: { from: string, to: string, when: { from: string, to: string | null } } = data.query;
        console.log("[TOOLS] AI tried to search tickets from", query.from, "to", query.to, "on date from", query.when.from, query.when.to ? `to date ${query.when.to}` : '');
        return generateMockTickets(query.from, query.to, 2, 5)
    }
}

async function main(request: UserMessage | FollowUpMessage) {
    const ai = new AIContextManager(client, tools, "llama3-70b-8192");

    await ai.initialize();

    await ai.execute(request)
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