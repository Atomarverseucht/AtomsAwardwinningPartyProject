import { Socket } from "socket.io";
import {Player} from "../shared/Player";
import type {clientPayload, Payload} from "../shared/Payload";

export class Room {
    public users = new Map<string, Player>();
    private userCount = 1;
    private sockets = new Map<string, Socket>();

    constructor(private readonly roomId: string) { }

    initUser(socket: Socket, playerID: string) {
        console.log("conn.init")
        const p = Array.from(this.users.entries()).find(([ connId , _]) => connId === playerID);
        let user: Player;
        if(p){
            const [oldK, pl] = p
            this.users.delete(oldK);
            this.sockets.delete(oldK);
            pl.isOnline = true;
            user = pl
        } else {
            const name = `Player ${this.userCount}`
            this.userCount++;
            user = new Player(name, playerID);
        }
        this.users.set(socket.id, user);
        const pl = this.makePayload("init", user.frontendId)
        this.sockets.set(socket.id, socket);
        socket.send(pl);
    }

    onMessage(data: clientPayload, user: string) {
        console.log(`server.onMessage ${data} from ${user}`);
    }

    broadcast(payload: Payload) {
        this.sockets.forEach((socket: Socket) => {socket.send(payload)});
    }

    send(user: string, data: Payload) {
        this.sockets.get(user)?.send(data);
    }

    exitUser(userID: string){
        const player = this.users.get(userID);
        if (player) {
            console.log("leave", player.accountId);
            player.isOnline = false;
            this.users.delete(userID);
            this.users.set(userID, player)
        }
    }

    public getPlayers() {
        return Array.from(this.users.values()).filter(p => p.isOnline)
    }

    makePayload(type: "init" | "turn" | "names", ownUserId?: string): Payload {
        switch (type) {
            case "init":
                return {
                    users: this.getPlayers(),
                    ownId: ownUserId
                };
            default:
                return {
                    users: this.getPlayers(),
                };
        }
    }
}