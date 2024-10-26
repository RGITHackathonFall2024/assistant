import Groq from 'groq-sdk';
import "dotenv/config";
import fs from "fs/promises";
import type { ChatCompletionCreateParamsNonStreaming } from 'groq-sdk/resources/chat/completions.mjs';
import { generateMockTickets } from './mock';
import type { FollowUpMessage } from './gen';

export interface UserMessage {
    type: "message";
    message: string;
    user_info: {
        name: string;
        location: string;
    }
    env_info: {
        current_date: string;
    }
}

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

async function main(request: UserMessage | FollowUpMessage, old_messages: any[] | undefined = undefined) {
    console.log(`[USER] executing`, request)
    const schema = await fs.readFile("assistant-schema.json", "utf-8");
    if (!old_messages) {
        old_messages = [
            { role: 'system', content: await fs.readFile("assistant-config.md", "utf-8") },
            { role: 'system',  content: `Ты ассистент который отвечает только в JSON\nJSON должен быть следущей схемы: ${schema}`,}
        ]
    }
    let history: ChatCompletionCreateParamsNonStreaming = {
        messages: [
            ...old_messages,
            { role: 'user', content: JSON.stringify(request) },
        ],
        model: "llama3-70b-8192",
        temperature: 0,
        max_tokens: 8000,
        top_p: 1,
        stream: false,
        response_format: {
            type: "json_object"
        },
        stop: null
    };
    
    const chatCompletion: Groq.Chat.ChatCompletion = await client.chat.completions.create(history);

    let data = JSON.parse(chatCompletion.choices[0].message.content!)

    if (!data.follow_up) {
        console.log(`[AI] response`, data.response)
        return {
            response: data.response,
            messages: [...history.messages, {role: "assistant", content: JSON.stringify(data)}]
        }
    }
    else {
        console.log("[AI] follow up", data.response)
        let responses: any[] = [];
       
        await Promise.all(data.function_calls.map(async (element: any) => {
            let function_name = element.namespace + "." + element.name;
            if (!(function_name in tools)) {
                console.error("[FATAL] AI tried to use unexpected function", element, "crashing...")
                process.exit(1);
            }
            else {
                console.log(`[TOOLS] AI called ${function_name} with`,element.args)
            }
            try {
                responses.push({
                    function: function_name,
                    response: await tools[function_name](element.args)
                });
            }
            catch (e) {
                console.error("[FATAL] error when executing function", element);
                console.error(e)
                process.exit(1);
            }
        }));

        return await main({
            type: "follow_up",
            responses: responses
        }, history.messages)

    }
}

main({
    type: "message",
    message: "Хочу билеты в питер на послезавтра",
    env_info: {
        current_date: new Date().toLocaleDateString("ru")
    },
    user_info: {
        name: "Дмитрий",
        location: "Ростов-на-Дону, Ростовская Область, Россия"
    }
});