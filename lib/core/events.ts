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
import { Memory, MemoryType } from "../types";
import { GenerateID, persen, checkMatch } from "../utils";
import {Events as Ev} from "../events";
import os from "os";
import config from "../database/config";


let memoryFirst: number | undefined;
let memoryStatus: Record<MemoryType, 0|1> = {
	low: 1,
	warn: 0,
	medium: 0,
	leak: 0,
	danger: 0
}
export default class Events implements Whatsapp.EventsOperator {
	private log: Logger | undefined;
	constructor(
		private sock: WASocket,
		private saveState: () => void,
		private sessions: string,
	) {}
	public readonly operator = () => {
		this.sock.ev.on("creds.update", this.saveState)
		this.sock.ev.on("connection.update", this.checkConnections);
		this.sock.ev.on("messages.upsert", this.messageHandler);
		this.sock.ev.on("new-message" as any, this.newMsg);
		//process.on("message", this.checkProcess);
	};
	public readonly setUtils = (logger: Logger): void => {
		this.log = logger;
	};
	public checkProcess = async (data: any) => {
		if (typeof data === "object") {
			if (data.id === "success.write.id") {
			} 
			 if (data.id === "getdb") {
				await this.sock.sendMessage(data.from, { text: data.content}, { quoted: data.quoted, messageId: GenerateID()})
			}
		}
	}
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
		if (mess.messages?.[0]?.message)
			this.sock.ev.emit(
				"new-message" as any,
				new Message(mess.messages[0], this.sock, this.log!) as any,
			);
	};
	private check = (client: Message): boolean => {
		const { prefix, isOwner, from, id } = client;
		if (!prefix?.isMatch) return false;
		let event: Array<Whatsapp.CommandEvents> = Ev.getEvents().setToArrayEvents()
		let cmd:Whatsapp.CommandEvents[] | (string|undefined)[] = event.filter(x => x.enable &&x.costumePrefix.isPrefix && x.execute);
		if (!isOwner) cmd = cmd.filter(x => !x.isOwner);
		cmd = cmd.map(x => {
			if (typeof x.help == "string") return x.help;
			if (Array.isArray(x.help)) {
				for (let index of x.help) {
					if (typeof index == "string") return index;
				}
			}
			if (typeof x.command == "string") return x.command;
			if (Array.isArray(x.command)) {
				for (let index of x.command) {
					if (typeof index == "string") return index;
				}
			}
		}).filter(x => !!x);
		let result =  checkMatch(prefix.body, cmd as string[]);
		if (result.length > 0 && !result.map((value) => value.find((v) => v == 100.00))?.[0]) {
			let text: string = "*「❗」* Maaf kak, Perintah ini tidak dapat digunakan karena perintah tersebut tidak ditemukan, Mungkin Maksud anda adalah\n";
			let number = 1;
			for (const value of result) {
				text += `\n\n${number++}. *${prefix.prefix} ${(value as Array<string|number>)[0]}* Dengan Rasio Keakuratan *${(value as Array<string|number>)[1]}%*`
			}
			text += `\n\nKetik *${prefix.prefix}menu* Untuk melihat daftar perintah yang tersedia`;
			client.reply(from, text, id);
			return true;
		} else return false;
	}
	protected newMsg = async (mess: Message) => {
		if (!mess.isOwner && config.create().config.memory !== "low") return;
		if (!memoryFirst) memoryFirst =  (Math.round(((os.freemem() / (1024 * 1024)) * 100)) / 100);
		if (this.check(mess)) return;
		await Ev.getEvents().commandCall(mess as Whatsapp.ClientType, async (message) => {
			let { from, id, realOwner } = message;
			//Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
			process?.send?.({ id: "write-keydb", data: JSON.stringify(message.GetSerialize(), null, 2)})
			if ((Math.round(((os.freemem() / (1024 * 1024)) * 100)) / 100) < persen(Number(memoryFirst), 95) && memoryStatus.danger == 0) {
				memoryStatus.danger = 1;
				process.env.memory = "danger";
				let { from, id} = message;
				this.log!.warn(`Penggunaan memory anda telah mencapai 95% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
				if (message.prefix?.isMatch) await message.reply(from, `*「⚠️」* Bot berada dalam mode *danger* bot otomatis dimatikan sampai owner menghidupkan bot kembali`, id);
				await message.sendText(from, "*「⚠️」* Memori anda sedang mencapai batas yang ditentukan proses otomatis akan di matikan")
				process.send?.({ id: "memory-danger"})
			} if ((Math.round(((os.freemem() / (1024 * 1024)) * 100)) / 100) < persen(Number(memoryFirst), 75) && memoryStatus.leak == 0) {
				memoryStatus.leak = 1;
				process.env.memory = "leak";
				let ev: Ev = Ev.getEvents()
				ev.clear();
				config.create().Set({ memory: "leak"})
				this.log!.warn(`Penggunaan memory anda telah mencapai 75% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
				if (message.prefix?.isMatch) message.reply(from, `*「❗」* Bot mengalami masalah memori, mohon maaf atas ketidaknyamanannya. Bot otomatis menghubungi owner untuk mengatasi masalah ini.`, id);
				message.sendText(realOwner, "*「❗」*  Penggunaan memory anda tersisa 25%, Bot otomatis mematikan semua aktivitas, ketik *help* untuk menggunakan perintah darurat. Disarankan untuk  mengosongkan memory anda manual sebelum menggunakan bot. Ketik *run* untuk meneruskan aktivitas bot tanpa alasan apapun");
				await ev.getCommandLeaking()
				ev = null as unknown as Ev;
				process.send?.({ id: "memory-leak"})
				setTimeout(async () => {
					if (config.create().config.memory == "low") return; 
					this.log!.warn(`Automatically restarting bot`);
					await ev.refresh()
					config.create().Set({ memory: "low" })
					await message.sendText(realOwner, "*✅* Bot otomatis dihidupkan dan reset ke mode *low*, bot otomatis berjalan tanpa database")
				}, 1000 * 60 * 60 * 1)
			} else if ((Math.round(((os.freemem() / (1024 * 1024)) * 100)) / 100) < persen(Number(memoryFirst), 50) && memoryStatus.medium == 0){
				memoryStatus.medium = Memory.medium;
				process.env.memory = "medium";
				let ev: Ev = Ev.getEvents()
				ev.clear();
				config.create().Set({ memory: "medium"})
				this.log!.warn(`Penggunaan memory anda telah mencapai 50% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
				if (message.prefix?.isMatch) message.reply(from, `*「❗」* Bot mengalami masalah memori, mohon maaf atas ketidaknyamanannya. Bot otomatis menghubungi owner untuk mengatasi masalah ini.`, id);
				message.sendText(realOwner, "*「❗」*  Penggunaan memory anda tersisa 50%, Bot otomatis mematikan semua aktivitas, ketik *help* untuk menggunakan perintah darurat")
				await ev.getCommandLeaking()
				ev = null as unknown as Ev;
				setTimeout(async ()  => {
					if (config.create().config.memory == "low") return; 
					this.log!.warn(`Automatically restarting bot`);
					await ev.refresh()
					config.create().Set({ memory: "low" })
					await message.sendText(realOwner, "*✅* Bot otomatis dihidupkan dan reset ke mode *low*")
				}, 1000 * 60 * 10)
			} else if ((Math.round(((os.freemem() / (1024 * 1024)) * 100)) / 100) < persen(Number(memoryFirst), 30) && memoryStatus.warn == 0) {
				process.env.memory = "warn";
				memoryStatus.warn = Memory.warn;
				this.log!.warn(`Penggunaan memory anda telah mencapai 30% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
				message.reply(realOwner, "*「❗」* Penggunaan memory anda tersisa 70%,");
			} 
		});
	};
}
