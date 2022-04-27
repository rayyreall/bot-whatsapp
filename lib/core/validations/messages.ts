import type {
	proto,
	WASocket,
	DownloadableMessage,
	MediaType,
} from "@adiwajshing/baileys";
import lodash from "lodash";
import EasyDB, {checkPrefix, DEFAULT_PREFIX} from "../../utils";
import {downloadContentFromMessage} from "@adiwajshing/baileys";
import Client from "../clients";
import Bluebird from "bluebird";
import crypto from "crypto";
import p from "path";
import Config from "../../database/config";
import * as fs from "fs";
import NodeCache from "node-cache";
import type Logger from "../../log";
import type {MimeType} from "file-type";
import type {Transform} from "stream";
import type Whatsapp from "../../types";
import type {Prefix} from "../../types";

export class Message
	extends Client
	implements Partial<Whatsapp.SerializeMessage>
{
	private db: NodeCache;
	constructor(
		msg: proto.IWebMessageInfo,
		public sock: WASocket,
		protected log: Logger,
	) {
		super();
		this.db = new NodeCache({
			stdTTL: 3,
		});
		this.serialize(msg);
		msg = null as unknown as proto.IWebMessageInfo;
	}
	private getDB<T extends keyof Whatsapp.SerializeMessage>(
		key: T,
	): Whatsapp.SerializeMessage[T] {
		return this.db.get(key) as Whatsapp.SerializeMessage[T];
	}
	private serialize(msg: proto.IWebMessageInfo) {
		if (msg.message?.protocolMessage) delete msg.message.protocolMessage;
		if (msg.message?.senderKeyDistributionMessage)
			delete msg.message.senderKeyDistributionMessage;
		if (msg.message?.messageContextInfo) delete msg.message.messageContextInfo;
		if (msg.key) {
			this.db.set("from", this.serializeJID(msg.key.remoteJid!));
			this.db.set("isGroupMsg", this.getDB("from").endsWith("@g.us"));
			this.db.set("fromMe", msg.key.fromMe);
			this.db.set("pushName", msg.pushName);
			this.db.set(
				"sender",
				msg.key.fromMe
					? this.sock?.user?.id
					: this.getDB("isGroupMsg")
					? String(msg.key.participant)
					: msg.key.remoteJid,
			);
			this.db.set("sender", this.serializeJID(this.getDB("sender")));
		}
		this.db.set(
			"message",
			JSON.parse(JSON.stringify(msg.message?.ephemeralMessage || msg)),
		);
		this.db.set("id", JSON.parse(JSON.stringify(msg)));
		this.db.set("type", lodash.keys(this.getDB("message")?.message || {})[0]);
		this.db.set("botNumber", this.serializeJID(this.sock?.user?.id as string));
		this.db.set("ownerNumber", [
			...Config.create().config.ownerNumber,
			this.getDB("botNumber"),
		]);
		this.db.set(
			"realOwner",
			Config.create().config.ownerNumber[0] || this.getDB("botNumber"),
		);
		if (!this.getDB("message")?.message) return;
		if (!this.getDB("type")) return;
		if (
			lodash.has(
				this.getDB("message").message,
				`${this.getDB("type")}.contextInfo`,
			)
		) {
			this.db.set(
				"quotedMsg",
				lodash.get(
					this.getDB("message").message,
					`${this.getDB("type")}.contextInfo`,
				),
			);
			this.db.set(
				"typeQuoted",
				lodash.keys(this.getDB("quotedMsg")?.quotedMessage)[0],
			);
		}
		let m: any = this.getDB("message")?.message?.[this.getDB("type")];
		if (this.getDB("quotedMsg")) delete m.contextInfo;
		this.db.set(
			"body",
			this.getDB("message")?.message?.conversation ||
				this.getDB("message").message?.extendedTextMessage?.text ||
				EasyDB.FindAndGet(m, "*caption") ||
				EasyDB.FindAndGet(m, "*selectedDisplayText") ||
				EasyDB.FindAndGet(m, "*title") ||
				EasyDB.FindAndGet(m, "*text"),
		);
		if (typeof this.getDB("body") === "object")
			this.db.set("body", lodash.values(this.getDB("body"))[0]);
		m = null;
		this.db.set(
			"buttonsID",
			lodash.values(
				EasyDB.FindAndGet(
					this.getDB("message")?.message as object,
					"*selectedButtonId",
				),
			)[0],
		);
		if (this.getDB("quotedMsg"))
			this.db.set(
				"mentioned",
				Number(this.getDB("quotedMsg")?.mentionedJid?.length) > 0
					? this.getDB("quotedMsg").mentionedJid!
					: this.getDB("quotedMsg")?.participant
					? [this.getDB("quotedMsg")?.participant]
					: [],
			);
		if (this.getDB("quotedMsg")?.quotedMessage) {
			this.db.set(
				"bodyQuoted",
				this.getDB("quotedMsg")?.quotedMessage?.conversation ||
					EasyDB.FindAndGet(
						this.getDB("quotedMsg")?.quotedMessage as object,
						"*text",
					) ||
					EasyDB.FindAndGet(
						this.getDB("quotedMsg")?.quotedMessage as object,
						"*caption",
					) ||
					EasyDB.FindAndGet(
						this.getDB("quotedMsg")?.quotedMessage as object,
						"*selectedDisplayText",
					) ||
					EasyDB.FindAndGet(
						this.getDB("quotedMsg")?.quotedMessage as object,
						"*title",
					),
			);
			if (typeof this.getDB("bodyQuoted") === "object")
				this.db.set(
					"bodyQuoted",
					lodash.values(this.getDB("bodyQuoted"))[0] || "",
				);
		}
		let [command, ...args] = this.getDB("body")?.split(" ") || [];
		this.db.set("command", command?.toLowerCase());
		this.db.set("args", args);
		this.db.set(
			"querry",
			this.getDB("args")?.length > 0
				? this.getDB("args")?.join(" ")
				: this.getDB("bodyQuoted") || "",
		);
		let mediaSupport: Array<keyof proto.IMessage> = [
			"imageMessage",
			"videoMessage",
			"audioMessage",
			"documentMessage",
			"stickerMessage",
		];
		if (
			mediaSupport.includes(this.getDB("type")) ||
			mediaSupport.includes(this.getDB("typeQuoted"))
		) {
			this.db.set("media", {
				type: mediaSupport.includes(this.getDB("type"))
					? this.getDB("type")
					: this.getDB("typeQuoted"),
				file: lodash
					.values(
						lodash.pick(
							mediaSupport.includes(this.getDB("type"))
								? this.getDB("message").message
								: this.getDB("quotedMsg")?.quotedMessage,
							mediaSupport,
						),
					)
					.filter((v) => !!v)[0] as proto.IMessage[Whatsapp.MediaSupport],
				mimetype: mediaSupport.includes(this.getDB("type"))
					? (this.getDB("message")?.message?.[
							this.getDB("type") as Whatsapp.MediaSupport
					  ]?.mimetype as MimeType)
					: (this.getDB("quotedMsg")?.quotedMessage![
							this.getDB("typeQuoted") as Whatsapp.MediaSupport
					  ]?.mimetype as MimeType),
			});
			m = this.getDB("media");
			m.type = m.type.replace("Message", "");
			this.db.set("media", m);
			m = null;
		} else if (
			this.getDB("type") === "viewOnceMessage" ||
			this.getDB("type") === "viewOnceMessage"
		) {
			this.db.set("media", {
				type: mediaSupport.includes(
					lodash.keys(
						this.getDB("message")?.message?.viewOnceMessage!.message,
					)[0] as keyof proto.IMessage,
				)
					? lodash.keys(
							this.getDB("message")?.message?.viewOnceMessage!.message,
					  )[0]
					: (lodash.keys(
							this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage?.message,
					  )[0] as keyof proto.IMessage),
				file: lodash
					.values(
						lodash.pick(
							mediaSupport.includes(
								lodash.keys(
									this.getDB("message")?.message?.viewOnceMessage!.message,
								)[0] as keyof proto.IMessage,
							)
								? this.getDB("message")?.message?.viewOnceMessage!.message
								: this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage!
										.message,
							mediaSupport,
						),
					)
					.filter((v) => !!v)[0] as proto.IMessage[Whatsapp.MediaSupport],
				mimetype: mediaSupport.includes(
					lodash.keys(
						this.getDB("message")?.message?.viewOnceMessage!.message,
					)[0] as keyof proto.IMessage,
				)
					? (this.getDB("message")?.message?.viewOnceMessage?.message?.[
							lodash.keys(
								this.getDB("message")?.message?.viewOnceMessage!.message,
							)[0] as Whatsapp.MediaSupport
					  ]?.mimetype as MimeType)
					: (this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage?.message?.[
							lodash.keys(
								this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage
									?.message,
							)[0] as Whatsapp.MediaSupport
					  ]?.mimetype as MimeType),
			});
			m = this.getDB("media");
			m.type = m.type.replace("Message", "");
			this.db.set("media", m);
			m = null;
		}
		this.db.set(
			"isMedia",
			["imageMessage", "videoMessage", "viewOnceMessage"].includes(
				this.getDB("type"),
			) ||
				["imageMessage", "videoMessage", "viewOnceMessage"].includes(
					this.getDB("typeQuoted"),
				),
		);
		this.db.set(
			"isAudio",
			this.getDB("type") === "audioMessage" ||
				this.getDB("typeQuoted") === "audioMessage",
		);
		this.db.set(
			"isVideo",
			this.getDB("type") === "videoMessage" ||
				this.getDB("typeQuoted") === "videoMessage",
		);
		this.db.set(
			"isDocument",
			this.getDB("type") === "documentMessage" ||
				this.getDB("typeQuoted") === "documentMessage",
		);
		this.db.set(
			"isSticker",
			this.getDB("type") === "stickerMessage" ||
				this.getDB("typeQuoted") === "stickerMessage",
		);
		this.db.set(
			"isImage",
			this.getDB("type") === "imageMessage" ||
				this.getDB("typeQuoted") === "imageMessage",
		);
		this.db.set(
			"isOwner",
			this.getDB("ownerNumber").includes(this.getDB("sender")),
		);
		this.db.set("prefix", checkPrefix(DEFAULT_PREFIX, this.getDB("command")));
	}
	public downloadMedia(media: Whatsapp.IMedia, path?: string): Promise<string>;
	public downloadMedia(path?: string): Promise<string>;
	public async downloadMedia(media?: Whatsapp.IMedia | string, path?: string) {
		return new Bluebird<string>(async (resolve, reject) => {
			if (typeof media === "undefined" || typeof this.media === "undefined")
				return reject(new Error("Media not found"));
			let m: Whatsapp.IMedia = typeof media === "string" ? this.media! : media;
			let Path: string | undefined = typeof media === "string" ? media : path;
			if (typeof Path !== "string")
				Path = p.join(
					__dirname,
					"../../database/media",
					crypto.randomBytes(16).toString("hex") +
						"." +
						m.mimetype.split("/")[1],
				);
			let file: Buffer | null = await this.decryptMedia(m);
			fs.writeFile(Path, file, (err) => {
				if (err) return reject(err);
				resolve(Path);
				file = null;
				m = null as unknown as Whatsapp.IMedia;
			});
		});
	}
	public ParsedMentions(text: string): Array<string> {
		return (
			text
				.match(/@(0|[0-9]{4,16})/g)
				?.map((values: string) => values.split("@")[1] + "@s.whatsapp.net") ||
			[]
		);
	}
	public async decryptMedia(media?: Whatsapp.IMedia): Promise<Buffer> {
		return new Bluebird<Buffer>(async (resolve, reject) => {
			if (typeof media === "undefined" || typeof this.media === "undefined")
				return reject(new Error("Media not found"));
			let buffer: Buffer | null = Buffer.from([]);
			try {
				let Stream: Transform | null = await downloadContentFromMessage(
					(media?.file as DownloadableMessage) ||
						(this.media?.file as DownloadableMessage),
					media.type as MediaType,
				);
				for await (const chunk of Stream) {
					buffer = Buffer.concat([buffer, chunk]);
				}
				resolve(buffer);
				Stream = null;
			} catch (err) {
				if (err instanceof Error) reject(new Error(err.stack));
			} finally {
				buffer = null;
			}
		});
	}
	public GetSerialize(): Whatsapp.SerializeMessage {
		return lodash.mapValues(
			this.db.data,
			(v) => v.v,
		) as unknown as Whatsapp.SerializeMessage;
	}
	public serializeJID(jid: string): string {
		if (/@g.us/gi.test(jid)) {
			return jid;
		} else if (/@s.whatsapp.net/gi.test(jid) && /\:/g.test(jid)) {
			return jid.split(":")[0] + "@s.whatsapp.net";
		} else {
			return jid;
		}
	}
	public get from(): string {
		return this.getDB("from");
	}
	public get fromMe(): boolean {
		return this.getDB("fromMe");
	}
	public get pushName(): string {
		return this.getDB("pushName");
	}
	public get id(): proto.IWebMessageInfo {
		return this.getDB("id");
	}
	public get realOwner(): string {
		return this.getDB("realOwner");
	}
	public get message(): proto.IFutureProofMessage {
		return this.getDB("message");
	}
	public get isGroupMsg(): boolean {
		return this.getDB("isGroupMsg");
	}
	public get type(): keyof proto.IMessage {
		return this.getDB("type");
	}
	public get typeQuoted(): keyof proto.IMessage | undefined {
		return this.getDB("typeQuoted");
	}
	public get quotedMsg(): proto.IContextInfo | undefined {
		return this.getDB("quotedMsg");
	}
	public get sender(): string {
		return this.getDB("sender");
	}
	public get botNumber(): string {
		return this.getDB("botNumber");
	}
	public get body(): string {
		return this.getDB("body");
	}
	public get buttonsID(): string | undefined {
		return this.getDB("buttonsID");
	}
	public get prefix(): Prefix | undefined {
		return this.getDB("prefix");
	}
	public get bodyQuoted(): string | null | undefined {
		return this.getDB("bodyQuoted");
	}
	public get mentioned(): Array<string> {
		return this.getDB("mentioned");
	}
	public get command(): string {
		return this.getDB("command");
	}
	public get args(): Array<string> {
		return this.getDB("args");
	}
	public get querry(): string {
		return this.getDB("querry");
	}
	public get media(): Whatsapp.IMedia | null | undefined {
		return this.getDB("media");
	}
	public get isMedia(): boolean {
		return this.getDB("isMedia");
	}
	public get isImage(): boolean {
		return this.getDB("isImage");
	}
	public get isVideo(): boolean {
		return this.getDB("isVideo");
	}
	public get isAudio(): boolean {
		return this.getDB("isAudio");
	}
	public get isDocument(): boolean {
		return this.getDB("isDocument");
	}
	public get isSticker(): boolean {
		return this.getDB("isSticker");
	}
	public get ownerNumber(): Array<string> {
		return this.getDB("ownerNumber");
	}
	public get isOwner(): boolean {
		return this.getDB("isOwner");
	}
}
