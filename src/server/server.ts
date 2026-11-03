import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server} from "socket.io";
import {Room} from "./room";
import {clientPayload} from "../shared/Payload";

const PORT = process.env.PORT || 3000;
export let rooms = new Map<string, Room>();

export const app = express();
app.use(helmet());
app.use(express.json());

export const httpServer = createServer(app);
httpServer.listen(PORT, () => console.log(`Express runs on Port: ${PORT}`));
export const wss = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" }
});
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_req, res) =>
    res.json({ status: "ok" }));

app.get("/api", (_req, res) =>
    res.json({ info: "This endpoint is not in use" }));


wss.on("connection", async (socket) => {
    const { room, playerID } = socket.handshake.query;
    const roomId = typeof room === "string" ? room : "default";
    console.log(roomId);
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Room(roomId));
    }
    const room_ = rooms.get(roomId)!;
    room_.initUser(socket,  playerID as string);

    socket.on("message", (data: clientPayload) => {
        room_.onMessage(data, socket.id);
    });

    socket.on("disconnect", () => {
        room_.exitUser(socket.id);
    });
});