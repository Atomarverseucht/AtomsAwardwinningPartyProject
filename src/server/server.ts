import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import { Room } from "./room";
import type { clientPayload } from "../shared/Payload";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export let rooms = new Map<string, Room>();

export const app = express();
app.use(
    helmet({
        contentSecurityPolicy: false, // Optional: adjust if helmet blocks Vite scripts/assets
    })
);
app.use(express.json());

export const httpServer = createServer(app);
httpServer.listen(PORT, () => console.log(`Express runs on Port: ${PORT}`));

// Allow dynamic CORS for development vs production
const corsOptions = {
    origin: isProduction ? false : "http://localhost:5173",
};

// ---------- Frontend - Endpoint ----------

const clientDir = path.resolve(import.meta.dirname, '../client');
// SPA-Fallback: alles, was kein API-Call oder Socket.io ist, bekommt die index.html
app.use((req, res, next) => {
    if (
        req.method !== "GET" ||
        req.path.startsWith("/api") ||
        req.path.startsWith("/socket.io")
    ) {
        return next();
    }
    res.sendFile(path.join(clientDir, "/index.html"));
});

// ---------- Web-Socket -----------
export const wss = new Server(httpServer, {
    cors: corsOptions,
});
app.use(cors(corsOptions));

app.get("/api/health", (_req, res) =>
    res.json({ status: "ok" }));

app.get("/api", (_req, res) =>
    res.json({ info: "This endpoint is not in use" }));

app.use(express.static(clientDir));

wss.on("connection", async (socket) => {
    const { room, playerID } = socket.handshake.query;
    const roomId = typeof room === "string" ? room : "default";
    console.log(roomId);
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Room(roomId));
    }
    const room_ = rooms.get(roomId)!;
    room_.initUser(socket, playerID as string);

    socket.on("message", (data: clientPayload) => {
        room_.onMessage(data, socket.id);
    });

    socket.on("disconnect", () => {
        room_.exitUser(socket.id);
    });
});