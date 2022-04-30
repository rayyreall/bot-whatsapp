import type { WASocket, ConnectionState, proto, MessageUpdateType } from "@adiwajshing/baileys";
import Logger from "../log";
import { Message } from "./validations";
import type Whatsapp from "../types";
export default class Events implements Whatsapp.EventsOperator {
    private sock;
    private saveState;
    private sessions;
    private log;
    constructor(sock: WASocket, saveState: () => void, sessions: string);
    readonly operator: () => void;
    readonly setUtils: (logger: Logger) => void;
    checkProcess: (data: any) => Promise<void>;
    protected checkConnections: (connections: Partial<ConnectionState>) => void;
    protected messageHandler: (mess: {
        messages: proto.IWebMessageInfo[];
        type: MessageUpdateType;
    }) => void;
    private check;
    protected newMsg: (mess: Message) => Promise<void>;
}
