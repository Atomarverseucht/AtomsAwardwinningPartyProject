import type {Player} from "./Player";

export type Payload = {
    readonly users?: Player[];
    readonly ownId?: string;
}

export type clientPayload = {
    readonly cmd: "open" | "changeName";
    readonly param: number | string;
}
