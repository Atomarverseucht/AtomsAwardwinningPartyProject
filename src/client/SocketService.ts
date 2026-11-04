import { io as socketIO } from "socket.io-client";
import type {clientPayload, Payload} from "../shared/Payload";

export let connService: connectService

export class connectService {
    private socket;
    // public changeState: (newState: Partial<UIState>) => void = () => {}

    constructor(memID?: number, readonly roomID?: string){
        const id = roomID ?? randomString();
        const token = localStorage.getItem("token");
        this.socket = socketIO("http://localhost:3000", {
            auth: { token },
            query: { room: id, memID: String(memID ?? 0), playerID: this.getPlayerId() }
        })
        this.socket.on("message", (data) => this.onMessage(data));
        connService = this;
    }
/*
    public setChangeState(f: (newState: Partial<UIState>) => void ): void {
        this.changeState = f;
    } */

    private onMessage(data: any){
        console.log("message: client", data);
        // this.changeState(data as Partial<UIState>);
        console.log("new Message: \n", data);
    }

    public sendMessage(data: clientPayload){
        console.log("sendMessage");
        this.socket.send(data);
    }

    public getPlayerId(): string {
        let id = localStorage.getItem("playerId");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("playerId", id);
        }
        return id;
    }
}

export function randomString(length = 4): string {
    return Math.random().toString(36).substring(2, 2 + length);
}