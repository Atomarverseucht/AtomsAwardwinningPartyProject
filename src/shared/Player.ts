import {v4 as uuidv4} from "uuid";

export class Player {

    isOnline: boolean = true;
    public readonly frontendId = uuidv4()

    constructor(public name: string,
                public accountId?: string) { }
}