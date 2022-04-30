import {Readable} from "stream";
import type Whatsapp from "../types";
import type {
	WASocket,
	AnyMessageContent,
	WAMediaUpload,
} from "@adiwajshing/baileys";
import {
	generateWAMessage,
	proto,
	generateWAMessageFromContent,
} from "@adiwajshing/baileys";
import NodeCache from "node-cache";
import EasyDB, {toBuffer, GenerateID} from "../utils";
import FileType from "file-type";
import type { FileTypeResult } from "file-type";
import Client from "./clients";

class createMetadata {
	public keyName: string | undefined;
	public from: string | undefined;
	public content: string | Buffer | Readable | undefined | Whatsapp.ButtonsContent;
	public options: Whatsapp.IOptionsMessage | undefined;
	private mediaType: Array<keyof Whatsapp.ContentData>;
	constructor(private sock: WASocket) {
		this.mediaType = ["image", "video", "audio", "document", "sticker"];
	}
	public async Builder(): Promise<proto.WebMessageInfo> {
		let msg: proto.WebMessageInfo;
		let metadata: proto.IMessage;
		if (!this.options) this.options = {};
		if (this.keyName == "buttons") {
			let m: proto.IButtonsMessage = {}
				this.content = this.content as Whatsapp.ButtonsContent;
				m.buttons = this.content.buttons.map((button: Whatsapp.IButtons) => {
					return {
						buttonId: button.buttonId,
						buttonText: {
							displayText: button.buttonText
						},
						type: button.type,
						...button.nativeFlowInfo ? { nativeFlowInfo: button.nativeFlowInfo } : {}
					}
				})
				m.headerType = this.content.headerType;
				m.contentText = this.content.contentText;
				m.footerText = this.content.footerText;
				if (typeof this.content.text == "string") m.text = this.content.text;
				if (m.headerType == 4) {
					m.imageMessage = (await new BulilderMetadata(this.sock).createImage(this.from!, this.content.media!).build()).message?.imageMessage;
				} else if (m.headerType == 5) {
					m.videoMessage = (await new BulilderMetadata(this.sock).createVideo(this.from!, this.content.media!).build()).message?.videoMessage;
				} else if (m.headerType == 6) {
					m.locationMessage = this.content.locations;
				} else if (m.headerType == 3) {
					m.documentMessage = (await new BulilderMetadata(this.sock).createDocument(this.from!, this.content.media!).build()).message?.documentMessage;
				}
				metadata = {
					[`buttonsMessage`]: proto.ButtonsMessage.fromObject(m)
				}
				this.keyName = "buttonsMessage";
				m = {}
				if (this.options.jpegThumbnail)
				EasyDB.FindAndSet(
					metadata,
					String(`*jpegThumbnail`),
					this.options.jpegThumbnail,
				);
			if (this.options.quoted)
				this.options.contextInfo = Object.assign(
					this.options.contextInfo ? this.options.contextInfo : {},
					{quotedMessage: this.options.quoted},
				);
			if (this.options.contextInfo) {
				let ctx: proto.IContextInfo | undefined;
				if (!EasyDB.FindHas(metadata, "*contextInfo")) {
					EasyDB.setObject(metadata, `${this.keyName}.contextInfo`, {});
				} else {
					ctx = EasyDB.FindAndGet(metadata, String(`*contextInfo`));
				}
				EasyDB.FindAndSet(
					metadata,
					`*contextInfo`,
					Object.assign(
						ctx ? ctx : {},
						this.options.contextInfo,
						this.options.externalAdReplyInfo
							? {
									externalAdReply: this.options.externalAdReplyInfo,
							  }
							: {},
					),
				);
				ctx = {};
			}
			msg = generateWAMessageFromContent(this.from!, metadata, {
				userJid: this.sock.authState.creds.me!.id,
				messageId: GenerateID(),
				quoted: this.options.quoted ? this.options.quoted : undefined,
			})
			msg.message = metadata;
			metadata = {};
			return msg  as proto.WebMessageInfo;
		} else {
			this.ParseType();
			if (
				this.keyName == "conversation" ||
				this.keyName == "extendedTextMessage"
			) {
				metadata = {
					[this.keyName as keyof proto.IMessage]:
						this.keyName == "conversation"
							? this.content
							: {
									text: this.content,
									...this.options.extendedInfo,
							  },
				};
			} else {
				metadata = {
					[this.keyName as keyof proto.IMessage]: {
						...((
							await generateWAMessage(
								String(this.from),
								{
									[this.keyName?.replace(
										"Message",
										"",
									) as keyof AnyMessageContent]: await this.ParseContent(),
								} as keyof AnyMessageContent,
								{
									userJid: this.sock.authState.creds.me!.id,
									upload: this.sock.waUploadToServer,
									messageId: GenerateID(),
								},
							).catch((e) => {
								throw e;
							})
						)?.message?.[this.keyName as keyof proto.IMessage] as proto.IMessage),
					},
				};
			}
			if (
				this.options.viewOnce &&
				["imageMessage", "videoMessage"].includes(String(this.keyName))
			) {
				EasyDB.FindAndSetWithPath(
					metadata,
					String(`*${this.keyName}`),
					"viewOnce",
					true,
				);
				if (this.options.caption)
					EasyDB.FindAndSetWithPath(
						metadata,
						String(`*${this.keyName}`),
						"caption",
						this.options.caption,
					);
				metadata = {
					viewOnceMessage: proto.FutureProofMessage.fromObject({
						message: proto.Message.fromObject({
							...EasyDB.FindAndGet(metadata, String(`*${this.keyName}`)),
						}),
					}),
				};
			}
			if (metadata.audioMessage) {
				if (this.options.ptt) metadata.audioMessage.ptt = true;
				if (this.options.seconds)
					metadata.audioMessage.seconds = this.options.seconds;
			}
			if (this.options.jpegThumbnail)
				EasyDB.FindAndSet(
					metadata,
					String(`*${this.keyName}.jpegThumbnail`),
					this.options.jpegThumbnail,
				);
			if (this.options.quoted)
				this.options.contextInfo = Object.assign(
					this.options.contextInfo ? this.options.contextInfo : {},
					{quotedMessage: this.options.quoted},
				);
			if (this.options.fileName && metadata.documentMessage)
				metadata.documentMessage.fileName = this.options.fileName;
			if (this.options.mimetype)
				EasyDB.FindAndSet(
					metadata,
					String(`*${this.keyName}.mimetype`),
					this.options.mimetype,
				);
			if (this.options.contextInfo) {
				let ctx: proto.IContextInfo | undefined;
				if (!EasyDB.FindHas(metadata, "*contextInfo")) {
					EasyDB.setObject(metadata, `${this.keyName}.contextInfo`, {});
				} else {
					ctx = EasyDB.FindAndGet(metadata, String(`*contextInfo`));
				}
				EasyDB.FindAndSet(
					metadata,
					`*contextInfo`,
					Object.assign(
						ctx ? ctx : {},
						this.options.contextInfo,
						this.options.externalAdReplyInfo
							? {
									externalAdReply: this.options.externalAdReplyInfo,
							  }
							: {},
					),
				);
				ctx = {};
			}
			msg = generateWAMessageFromContent(String(this.from), metadata, {
				userJid: this.sock.authState.creds.me!.id,
				messageId: GenerateID(),
				quoted: this.options.quoted ? this.options.quoted : undefined
			});
			if (this.options.contextInfo)
				EasyDB.setObject(
					metadata,
					`${Object.keys(metadata)[0]}.contextInfo`,
					Object.assign(
						(
							msg.message?.[
								Object.keys(msg.message || {})[0] as keyof proto.IMessage
							] as any
						)?.contextInfo,
						(
							metadata[
								Object.keys(metadata || {})[0] as keyof proto.IMessage
							] as any
						)?.contextInfo,
					),
				);
			if (this.options.mentioned) EasyDB.FindAndSetWithPath(metadata, "*contextInfo", "mentionedJid", this.options.mentioned, true)
			msg.message = metadata;
			metadata = {};
			return msg;
		}
	}
	private async ParseContent(): Promise<WAMediaUpload | null> {
		const cache: NodeCache = new NodeCache({
			stdTTL: 6,
		});
		if (Buffer.isBuffer(this.content)) {
			cache.set("content", this.content);
		} else if (this.content instanceof Readable) {
			cache.set("content", {
				stream: this.content,
			});
		} else if (typeof this.content == "string") {
			cache.set("content", await toBuffer(this.content));
		} else {
			throw new Error("Your content is not valid");
		}
		return cache.get("content") as WAMediaUpload | null;
	}
	private ParseType(): void {
		if (
			this.mediaType.includes(
				String(this.keyName) as keyof Whatsapp.ContentData,
			)
		) {
			this.keyName = `${this.keyName}Message`;
		} else if (
			this.keyName === "text" &&
			Object.keys(this.options as Whatsapp.IOptionsMessage).length > 0
		) {
			this.keyName = "extendedTextMessage";
		} else if (this.keyName == "text") {
			this.keyName = "conversation";
		} else {
			throw new Error("Your key is not valid");
		}
	}
}

export default class BulilderMetadata<T extends proto.IMessage> {
	private metadata: createMetadata;
	constructor(private sock: WASocket) {
		this.metadata = new createMetadata(this.sock);
	}
	public setImage(): BulilderMetadata<T> {
		this.metadata.keyName = "image";
		return this;
	}
	public setVideo(): BulilderMetadata<T> {
		this.metadata.keyName = "video";
		return this;
	}
	public setProto(name: string): BulilderMetadata<T> {
		this.metadata.keyName = name;
		return this;
	}
	public setAudio(): BulilderMetadata<T> {
		this.metadata.keyName = "audio";
		return this;
	}
	public setSticker(): BulilderMetadata<T> {
		this.metadata.keyName = "sticker";
		return this;
	}
	public setButtons (): BulilderMetadata<T> {
		this.metadata.keyName = "buttons";
		return this;
	}
	public setDocument(): BulilderMetadata<T> {
		this.metadata.keyName = "document";
		return this;
	}
	public setText(): BulilderMetadata<T> {
		this.metadata.keyName = "text";
		return this;
	}
	public setFrom(from: string): BulilderMetadata<T> {
		this.metadata.from = from;
		return this;
	}
	public setContent(content: string | Buffer | Readable): BulilderMetadata<T> {
		this.metadata.content = content;
		return this;
	}
	public setOptions(options: Whatsapp.IOptionsMessage): BulilderMetadata<T> {
		this.metadata.options = options;
		return this;
	}
	public createImage(
		from: string,
		content: string | Buffer | Readable,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "image";
		return this;
	}
	public createVideo(
		from: string,
		content: string | Buffer | Readable,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "video";
		return this;
	}
	public createAudio(
		from: string,
		content: string | Buffer | Readable,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "audio";
		return this;
	}
	public createButtons (from: string, content: Whatsapp.ButtonsContent, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "buttons";
		return this;
	}
	public createSticker(
		from: string,
		content: string | Buffer | Readable,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "sticker";
		return this;
	}
	public createDocument(
		from: string,
		content: string | Buffer | Readable,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "document";
		return this;
	}
	public createText(
		from: string,
		content: string | Buffer | Readable,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = "text";
		return this;
	}
	public create(
		from: string,
		content: string | Buffer | Readable | Whatsapp.ButtonsContent,
		type: keyof Whatsapp.ContentData,
		options?: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
		this.metadata.from = from;
		this.metadata.content = content;
		this.metadata.options = options ? options : this.metadata.options;
		this.metadata.keyName = type;
		return this;
	}
	public async build(): Promise<proto.WebMessageInfo> {
		if (typeof this.metadata.keyName == "undefined")
			throw new Error("You must set a type of message");
		if (typeof this.metadata.from == "undefined")
			throw new Error("You must set a from");
		if (typeof this.metadata.content == "undefined")
			throw new Error("You must set a content");
		if (this.metadata.keyName == "buttons") {
			if (typeof this.metadata.content == "object") {
				if (!Array.isArray((this.metadata.content as Whatsapp.ButtonsContent).buttons)) throw new Error("You must set Buttons Array type");
				if ((this.metadata.content as Whatsapp.ButtonsContent).buttons.length == 0) throw new Error("You must set a buttons");
				else {
					(this.metadata.content as Whatsapp.ButtonsContent).buttons = (this.metadata.content as Whatsapp.ButtonsContent).buttons.map((value) => {
						return { buttonId: value.buttonId || "1", type: value.type || 1, buttonText: value.buttonText}
					})
				}
				if(typeof (this.metadata.content as Whatsapp.ButtonsContent).media !== "undefined" ) (this.metadata.content as Whatsapp.ButtonsContent).media = await toBuffer((this.metadata.content as Whatsapp.ButtonsContent).media!) as Buffer;
				if (typeof (this.metadata.content as Whatsapp.ButtonsContent).locations !== "undefined" && typeof (this.metadata.content as Whatsapp.ButtonsContent).headerType == "undefined") (this.metadata.content as Whatsapp.ButtonsContent).headerType = 6;
				if (typeof (this.metadata.content as Whatsapp.ButtonsContent).headerType == undefined) {
					if (typeof (this.metadata.content as Whatsapp.ButtonsContent).media == "undefined") (this.metadata.content as Whatsapp.ButtonsContent).headerType = 0;
					else if (typeof (this.metadata.content as Whatsapp.ButtonsContent).isDocs) (this.metadata.content as Whatsapp.ButtonsContent).headerType = 3;
					else {
						let mime: FileTypeResult | undefined |  {type: keyof Whatsapp.ContentData; ext: string} | null = await FileType.fromBuffer((this.metadata.content as Whatsapp.ButtonsContent).media as Buffer);
						if (typeof mime == "undefined") throw new Error("Cannot Extract Your Type");
						mime = Client.ParseExtentions(mime.mime);
						if (typeof mime == "undefined") throw new Error("Cannot Extract Your Type");
						if (mime.type == "document") (this.metadata.content as Whatsapp.ButtonsContent).headerType = 3;
						else if (mime.type == "image") (this.metadata.content as Whatsapp.ButtonsContent).headerType = 4;
						else if (mime.type == "video") (this.metadata.content as Whatsapp.ButtonsContent).headerType = 5;
						else throw new Error("Cannot Extract Your Type");
					}
				}
			}
		}
		return await this.metadata.Builder();
	}
}
