import {DisconnectReason} from "@adiwajshing/baileys";
import type {
	WASocket,
	ConnectionState,
	proto,
	MessageUpdateType,
} from "@adiwajshing/baileys";
import type {Boom} from "@hapi/boom";
import Logger from "../log";
import createWA from "./main";
import {Message} from "./validations";
import type Whatsapp from "../types";
import {Events as Ev} from "../events";
import performa from "performance-now";

export default class Events implements Whatsapp.EventsOperator {
	private log: Logger | undefined;
	constructor(
		private sock: WASocket,
		private saveState: () => void,
		private sessions: string,
	) {}
	public readonly operator = () => {
		this.sock.ev.on("creds.update", this.saveState);
		this.sock.ev.on("connection.update", this.checkConnections);
		this.sock.ev.on("messages.upsert", this.messageHandler);
		this.sock.ev.on("new-message" as any, this.newMsg);
	};
	public readonly setUtils = (logger: Logger): void => {
		this.log = logger;
	};
	protected checkConnections = (connections: Partial<ConnectionState>) => {
		if (connections.connection === "close") {
			if (
				(connections.lastDisconnect?.error as Boom)?.output?.statusCode !==
				DisconnectReason.loggedOut
			) {
				createWA(this.sessions, this.log!);
			} else {
				this.log!.error("Logged out");
				process.exit(1);
			}
		}
	};
	protected messageHandler = (mess: {
		messages: proto.IWebMessageInfo[];
		type: MessageUpdateType;
	}) => {
		if (mess.messages[0].message)
			this.sock.ev.emit(
				"new-message" as any,
				new Message(mess.messages[0], this.sock, this.log!) as any,
			);
	};
	protected newMsg = async (mess: Message) => {
		if (!mess.isOwner) return;
		await Ev.getEvents().commandCall(mess as Whatsapp.ClientType)
	};
}
