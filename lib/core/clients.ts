import type {WASocket} from "@adiwajshing/baileys";
import type Logger from "../log";
import type Whatsapp from "../types";
import type {Readable} from "stream";
import Bluebird from "bluebird";
import Builder from "./cli";
import EasyDB, {toBuffer, GenerateID, compressImage} from "../utils";
import type {FileTypeResult, MimeType} from "file-type";
import mime from "file-type";
import {generateWAMessageFromContent, proto} from "@adiwajshing/baileys";
import PhoneNumber from "awesome-phonenumber";

export default abstract class Client implements Whatsapp.IClient {
	constructor() {}

	public abstract get from(): string;

	public abstract get fromMe(): boolean;

	public abstract get pushName(): string;

	public abstract get id(): proto.IWebMessageInfo;

	public abstract get message(): proto.IFutureProofMessage;

	public abstract get isGroupMsg(): boolean;

	public abstract get type(): keyof proto.IMessage;

	public abstract get typeQuoted(): keyof proto.IMessage | undefined;

	public abstract get quotedMsg(): proto.IContextInfo | undefined;

	public abstract get sender(): string;

	public abstract get botNumber(): string;

	public abstract get body(): string;

	public abstract get buttonsID(): string | undefined;

	public abstract get bodyQuoted(): string | null | undefined;

	public abstract get mentioned(): Array<string>;

	public abstract get command(): string;

	public abstract get args(): Array<string>;

	public abstract get querry(): string | undefined;

	public abstract get media(): Whatsapp.IMedia | null | undefined;

	public abstract get isMedia(): boolean;

	public abstract get isImage(): boolean;

	public abstract get isVideo(): boolean;

	public abstract get isAudio(): boolean;

	public abstract get isDocument(): boolean;

	public abstract get isSticker(): boolean;

	public abstract sock: WASocket;

	public abstract downloadMedia(
		media?: Whatsapp.IMedia | string,
		path?: string,
	): Promise<string>;

	protected abstract log: Logger;

	public abstract ParsedMentions(text: string): Array<string>;

	public abstract decryptMedia(media?: Whatsapp.IMedia): Promise<Buffer>;

	public Generate(
		from: string,
		content: string | Buffer | Readable | Whatsapp.ButtonsContent,
		type: keyof Whatsapp.ContentData,
		options?: Whatsapp.IOptionsMessage,
	): Promise<proto.WebMessageInfo>;
	public Generate(): Builder<proto.IMessage>;
	public Generate(
		from?: string,
		content?: string | Buffer | Readable | Whatsapp.ButtonsContent,
		type?: keyof Whatsapp.ContentData,
		options?: Whatsapp.IOptionsMessage,
	): Builder<proto.IMessage> | Promise<proto.WebMessageInfo> {
		if (from && content && type) {
			return new Bluebird(async (resolve) => {
				let m: Builder<proto.IMessage> = new Builder<proto.IMessage>(this.sock);
				m.create(
					String(from),
					content as typeof content,
					type as typeof type,
					options,
				);
				resolve(await m.build().catch((err) => this?.log?.error(err)) as proto.WebMessageInfo);
			});
		}
		return new Builder<proto.IMessage>(this.sock);
	}
	public sendFile(
		from: string,
		content: string | Buffer | Readable,
		options: Whatsapp.IOptionsMessage & {isDocs?: boolean} = {},
	): Promise<proto.IWebMessageInfo | void> {
		return new Bluebird<proto.WebMessageInfo>(async (resolve) => {
			let m: proto.WebMessageInfo;
			let file: Buffer | null = await toBuffer(content);
			try {
				if (!file) return void this?.log?.error("Your file is undefined");
				let types: FileTypeResult | undefined = await mime.fromBuffer(
					file as Buffer,
				);
				if (!types) return void this?.log?.error("Your file is undefined");
				let type: keyof Whatsapp.ContentData | undefined = this.ParseExtentions(
					types.mime,
				)?.type;
				if (!type) return void this?.log?.error("Your file is undefined");
				if (typeof options.mimetype == "undefined")
					options.mimetype = types.mime;
				if (options.isDocs) type = "document";
				switch (type) {
					case "image":
						m = await this.sendImage(from, file as Buffer, options);
						break;
					case "video":
						m = await this.sendVideo(from, file as Buffer, options);
						break;
					case "audio":
						m = await this.sendAudio(from, file as Buffer, options);
						break;
					case "document":
						m = await this.sendDocument(
							from,
							file as Buffer,
							options as Whatsapp.MetadataDocument,
						);
						break;
					case "sticker":
						m = await this.sendSticker(from, file as Buffer, options);
						break;
					default:
						return void this?.log?.error("Your file is undefined");
				}
				resolve(m);
				m = {} as proto.WebMessageInfo;
				file = null;
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			}
		});
	}
	public async sendText(
		from: string,
		content: string,
	): Promise<proto.WebMessageInfo | void> {
		return Bluebird.try(async () => {
			let m: proto.WebMessageInfo = await this.Generate(from, content, "text");
			await this.relayMessage(m);
			return m;
		}).catch((err) => this?.log?.error(err));
	}
	public async sendTextWithMentions(from: string, content: string, id?: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo|void> {
		return Bluebird.try(async () => {
			let m: proto.WebMessageInfo = await this.Generate(from, content, "text", {
				mentioned: this.ParsedMentions(content),
				quoted: id
			});
			await this.relayMessage(m);
			return m;
		}).catch((err) => this?.log?.error(err));
	}
	public async reply(
		from: string,
		content: string,
		id?: proto.IWebMessageInfo,
	): Promise<proto.WebMessageInfo | void> {
		return Bluebird.try(async () => {
			let m: proto.WebMessageInfo = await this.Generate(from, content, "text", {
				quoted: id,
			});
			await this.relayMessage(m);
			return m;
		}).catch((err) => this?.log?.error(err));
	}
	public async wait(
		from: string,
		id: proto.IWebMessageInfo,
	): Promise<proto.WebMessageInfo | void> {
		return await this.reply(
			from,
			"*⌛* Mohon tunggu sebentar bot sedang melaksanakan perintah",
			id,
		);
	}
	public async sendDocument(
		from: string,
		content: string | Buffer | Readable,
		options: Whatsapp.MetadataDocument,
	): Promise<proto.WebMessageInfo> {
		return new Bluebird<proto.WebMessageInfo>(async (resolve) => {
			let file: Buffer | null = await toBuffer(content);
			let m: proto.WebMessageInfo;
			try {
				if (!file) return void this?.log?.error("Your document is undefined");
				m = await this.Generate(from, file, "document", options);
				await this.relayMessage(m);
				resolve(m);
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			} finally {
				file = null;
				options = {} as Whatsapp.MetadataDocument;
				m = {} as proto.WebMessageInfo;
			}
		});
	}
	public async sendAudio(
		from: string,
		content: string | Buffer | Readable,
		options: Whatsapp.MetadataAudio = {},
	): Promise<proto.WebMessageInfo> {
		return new Bluebird<proto.WebMessageInfo>(async (resolve) => {
			let file: Buffer | null = await toBuffer(content);
			let m: proto.WebMessageInfo;
			try {
				if (!file) return void this?.log?.error("Your audio is undefined");
				m = await this.Generate(from, file, "audio", options);
				await this.relayMessage(m);
				resolve(m);
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			} finally {
				file = null;
				options = {};
				m = {} as proto.WebMessageInfo;
			}
		});
	}
	public static ParseExtentions (mimeType: MimeType): {type: keyof Whatsapp.ContentData; ext: string} | undefined {
		if (mimeType.startsWith("application") || mimeType.startsWith("font")) {
			return {type: "document", ext: mimeType.split("/")[1]};
		} else if (mimeType.startsWith("image")) {
			if (mimeType === "image/webp") return {type: "sticker", ext: "webp"};
			else return {type: "image", ext: mimeType.split("/")[1]};
		} else if (mimeType.startsWith("video")) {
			return {type: "video", ext: mimeType.split("/")[1]};
		} else if (mimeType.startsWith("audio")) {
			return {type: "audio", ext: mimeType.split("/")[1]};
		}
	}
	private ParseExtentions(
		mimeType: MimeType,
	): {type: keyof Whatsapp.ContentData; ext: string} | undefined {
		return Client.ParseExtentions(mimeType);
	}
	public async sendSticker(
		from: string,
		content: string | Buffer | Readable,
		options: Whatsapp.MetadataSticker = {},
	): Promise<proto.WebMessageInfo> {
		return new Bluebird<proto.WebMessageInfo>(async (resolve) => {
			let file: Buffer | null = await toBuffer(content);
			let m: proto.WebMessageInfo;
			try {
				if (!file) return void this?.log?.error("Your sticker is undefined");
				m = await this.Generate(from, file, "sticker", options);
				await this.relayMessage(m);
				resolve(m);
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			} finally {
				file = null;
				options = {};
				m = {} as proto.WebMessageInfo;
			}
		});
	}
	public async sendContact (from: string, content: Whatsapp.ContactsContent, ctx?: proto.IContextInfo): Promise<proto.IWebMessageInfo> {
		let ph: PhoneNumber = new PhoneNumber(content.phone);
		const vcard: string = `
BEGIN:VCARD
VERSION:3.0
FN:${content.name}
TEL;type=CELL;type=VOICE;waid=${content.phone}:${ph.getNumber("international")}
END:VCARD
`
     return await this.relayMessage(await this.prepareMessage(from, proto.Message.fromObject({
		contactMessage: proto.ContactMessage.fromObject({
		   displayName: content.name,
		   vcard,
		   ...ctx ? { contextInfo: ctx } : {}
		})
	})))
	}
	public async sendButtons(from: string, content: Whatsapp.ButtonsContent, options?: Whatsapp.MetadataDefault): Promise<proto.WebMessageInfo> {
		return new Bluebird(async (resolve) => {
			let m: proto.WebMessageInfo;
			try {
				m = await this.Generate(from, content, "buttons", options);
				await this.relayMessage(m);
				resolve(m);
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			} finally {
				content = {} as Whatsapp.ButtonsContent;
				m = {} as proto.WebMessageInfo;
			}
		});
	}
	public async sendVideo(
		from: string,
		content: string | Buffer | Readable,
		options: Whatsapp.MetadataVideo = {},
	): Promise<proto.WebMessageInfo> {
		return new Bluebird<proto.WebMessageInfo>(async (resolve) => {
			let file: Buffer | null = await toBuffer(content);
			let m: proto.WebMessageInfo;
			try {
				if (!file) return void this?.log?.error("Your video is undefined");
				if (options.isMentions) {
					EasyDB.setObject(
						options,
						"contextInfo.mentionedJid",
						this.ParsedMentions(from),
					);
					delete options.isMentions;
				}
				if (typeof options.jpegThumbnail == "undefined")
					options.jpegThumbnail = await compressImage(file);
				m = await this.Generate(from, file, "video", options);
				await this.relayMessage(m);
				resolve(m);
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			} finally {
				file = null;
				options = {};
				m = {} as proto.WebMessageInfo;
			}
		});
	}
	public async sendImage(
		from: string,
		content: string | Buffer | Readable,
		options: Whatsapp.MetadataImage = {} as Whatsapp.MetadataImage,
	): Promise<proto.WebMessageInfo> {
		return new Bluebird<proto.WebMessageInfo>(async (resolve) => {
			let file: Buffer | null = await toBuffer(content);
			let m: proto.WebMessageInfo;
			try {
				if (!file) return void this?.log?.error("Your image is undefined");
				if (options.isMentions) {
					EasyDB.setObject(
						options,
						"contextInfo.mentionedJid",
						this.ParsedMentions(from),
					);
					delete options.isMentions;
				}
				if (typeof options.jpegThumbnail == "undefined")
					options.jpegThumbnail = await compressImage(file);
				m = await this.Generate(from, file, "image", options);
				await this.relayMessage(m);
				resolve(m);
			} catch (err) {
				if (err instanceof Error) {
					this?.log?.error(err.message);
				}
			} finally {
				file = null;
				options = {};
				m = {} as proto.WebMessageInfo;
			}
		});
	}

	public async prepareMessage(
		from: string,
		content: proto.IMessage,
		options: Whatsapp.IOptionsParams = {},
	): Promise<proto.IWebMessageInfo> {
		return new Bluebird<proto.IWebMessageInfo>(async (resolve) => {
			if (!("userJid" in options))
				options.userJid = this.sock.authState.creds.me!.id;
			if (!("messageId" in options)) options.messageId = GenerateID();
			if (
				typeof options.viewOnce == "boolean" &&
				content.viewOnceMessage?.message
			) {
				EasyDB.FindAndSet(
					content,
					"viewOnceMessage.message*.viewOnce",
					options.viewOnce,
				);
			} else if (typeof options.viewOnce == "boolean") {
				content = {
					viewOnceMessage: proto.FutureProofMessage.fromObject({
						message: content,
					}),
				};
			}
			let m: proto.WebMessageInfo | undefined = generateWAMessageFromContent(
				from,
				content,
				{
					messageId: GenerateID(),
					userJid: options.userJid as string,
					...options,
				},
			);
			resolve(m);
			m = undefined;
			content = null as unknown as proto.IMessage;
		});
	}
	public async relayMessage(
		content: proto.IWebMessageInfo,
	): Promise<proto.IWebMessageInfo> {
		return new Bluebird<proto.IWebMessageInfo>(async (resolve) => {
			try {
				if (!content.key)
					return void this?.log?.error("Your key WebMessageInfo is undefined");
				await this.sock.relayMessage(
					String(content.key.remoteJid),
					content.message as proto.IMessage,
					{messageId: content.key.id || GenerateID()},
				);
				resolve(content);
				content = null as unknown as proto.IWebMessageInfo;
			} catch (e) {
				if (e instanceof Error) {
					this?.log?.error(e.message);
				}
			}
		});
	}
}
