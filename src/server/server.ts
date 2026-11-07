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

export const wss = new Server(httpServer, {
    cors: corsOptions,
});
app.use(cors(corsOptions));

app.get("/api/health", (_req, res) =>
    res.json({ status: "ok" }));

app.get("/api", (_req, res) =>
    res.json({ info: "This endpoint is not in use" }));

// 1. Serve static files from the built client directory in production
if (isProduction) {
    // dist/server -> dist/client
    const clientPath = path.join(__dirname, "../client");
    app.use(express.static(clientPath));

    // 2. Fallback route for React Router (SPA support)
    app.get("*", (_req, res) => {
        res.sendFile(path.join(clientPath, "index.html"));
    });
}

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