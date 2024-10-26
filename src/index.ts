import Groq from 'groq-sdk';
import "dotenv/config";
import fs from "fs/promises";
import type { FollowUpMessage } from './gen';
import { AIContextManager, type Message, type ToolFunction, type Tools, type UserMessage } from './ai';
import { apiTools } from './apis';
import { createServer } from "http";
import express from "express";
import { Server } from 'socket.io';
import cors from "cors";

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

let tools: Tools = {
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
        let hello = { role: "assistant", content: `Здравствуй ${user_info.name}, я Ранчер твой помощник от банка Центр-Инвест.` } satisfies Message;
        await ai.initialize(await fs.readFile("assistant-config.md", "utf-8"), [hello]);
        sock.emit("new_message", hello);
    });

    sock.on("message", async (text) => {
        sock.emit("new_message", {role: "user", content: text} satisfies Message);
        await ai.execute({
            content: text,
            env_info,
            user_info,
            type: "user_message"
        }, (message) => {
            if (message.content) {
                sock.emit("new_message", {role: "assistant", content: message.content} satisfies Message);
            }
        });
    });
});

server.listen(3000, '0.0.0.0', 511, () => {
    console.log("[API] Serving on :3000");
});