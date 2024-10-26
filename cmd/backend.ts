import Groq from 'groq-sdk';
import "dotenv/config";
import fs from "fs/promises";
import type { FollowUpMessage } from '../src/gen';
import { AIContextManager, type UserMessage } from '../src/ai';
import { apiTools } from '../src/apis';
import { createServer } from "http";
import express from "express";
import { Server } from 'socket.io';
import cors from "cors";
import type { ChatCompletionMessage, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions.mjs';
import { getTicketInfo } from '../src/apis/rzd/getTicket';

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

let tools = {
    ...apiTools
};

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

io.on("connect", async (sock) => {
    const log = (...data: any) => console.log(`[socket:${sock.id}]`, ...data);
    const ai = new AIContextManager(client, tools, "llama3-70b-8192");
    let env_info = {
        current_date: new Date().toLocaleDateString("ru")
    };
    let user_info = {
        name: "Дмитрий",
        location: "Ростов-на-Дону, Ростовская Область, Россия"
    };

    log("Connected");

    sock.on("disconnect", () => {
        log("Disconnected");
    });

    sock.on("start_chat", async () => {
        let hello = { role: "assistant", content: JSON.stringify({follow_up: false, response: [{type: "text", text: `Здравствуй ${user_info.name}, я Ранчер твой помощник от банка Центр-Инвест.`}]}) } satisfies ChatCompletionMessageParam;
        await ai.initialize( [hello]);
        sock.emit("new_message", hello);
    });

    sock.on("message", async (text) => {
        sock.emit("new_message", {role: "user", content: JSON.stringify({follow_up: false, response: [{type: "text", text}]})} satisfies ChatCompletionMessageParam);
        await ai.execute({
            content: text,
            env_info,
            user_info,
            type: "user_message"
        }, (message) => {
            if (message.content) {
                sock.emit("new_message", {role: "assistant", content: message.content});
            }
        });
    });
});

app.get("/rzd/ticket/:ticket_id", async (req, res) => {
    res.status(200).json(getTicketInfo(req.params.ticket_id));
})

server.listen(3000, '0.0.0.0', 511, () => {
    console.log("[API] Serving on :3000");
});