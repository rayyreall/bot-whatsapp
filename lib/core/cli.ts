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

class createMetadata {
	public keyName: string | undefined;
	public from: string | undefined;
	public content: string | Buffer | Readable | undefined;
	public options: Whatsapp.IOptionsMessage | undefined;
	private mediaType: Array<keyof Whatsapp.ContentData>;
	constructor(private sock: WASocket) {
		this.mediaType = [
			"image",
			"video",
			"audio",
			"document",
			"sticker",
		];
	}
	public async Builder(): Promise<proto.WebMessageInfo> {
		let msg: proto.WebMessageInfo;
		let metadata: proto.IMessage;
		if (!this.options) this.options = {};
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
								...this.options
									.extendedInfo,
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
								) as keyof AnyMessageContent]:
									await this.ParseContent(),
							} as keyof AnyMessageContent,
							{
								userJid: this.sock
									.authState.creds
									.me!.id,
								upload: this.sock
									.waUploadToServer,
								messageId: GenerateID(),
							},
						).catch((e) => {
							throw e;
						})
					)?.message?.[
						this.keyName as keyof proto.IMessage
					] as proto.IMessage),
				},
			};
		}
		if (
			this.options.viewOnce &&
			["imageMessage", "videoMessage"].includes(
				String(this.keyName),
			)
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
				viewOnceMessage:
					proto.FutureProofMessage.fromObject({
						message: proto.Message.fromObject({
							...EasyDB.FindAndGet(
								metadata,
								String(
									`*${this.keyName}`,
								),
							),
						}),
					}),
			};
		}
		if (metadata.audioMessage) {
			if (this.options.ptt) metadata.audioMessage.ptt = true;
			if (this.options.seconds)
				metadata.audioMessage.seconds =
					this.options.seconds;
		}
		if (this.options.jpegThumbnail)
			EasyDB.FindAndSet(
				metadata,
				String(`*${this.keyName}.jpegThumbnail`),
				this.options.jpegThumbnail,
			);
		if (this.options.quoted)
			this.options.contextInfo = Object.assign(
				this.options.contextInfo
					? this.options.contextInfo
					: {},
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
				EasyDB.setObject(
					metadata,
					`${this.keyName}.contextInfo`,
					{},
				);
			} else {
				ctx = EasyDB.FindAndGet(
					metadata,
					String(`*contextInfo`),
				);
			}
			EasyDB.FindAndSet(
				metadata,
				`*contextInfo`,
				Object.assign(
					ctx ? ctx : {},
					this.options.contextInfo,
					this.options.externalAdReplyInfo
						? {
								externalAdReply:
									this.options
										.externalAdReplyInfo,
						  }
						: {},
				),
			);
			ctx = {};
		}
		msg = generateWAMessageFromContent(String(this.from), metadata, {
			userJid: this.sock.authState.creds.me!.id,
			messageId: GenerateID(),
			quoted: this.options.quoted
				? this.options.quoted
				: undefined,
		});
		if (this.options.contextInfo)
			EasyDB.setObject(
				metadata,
				`${Object.keys(metadata)[0]}.contextInfo`,
				Object.assign(
					(
						msg.message?.[
							Object.keys(
								msg.message || {},
							)[0] as keyof proto.IMessage
						] as any
					)?.contextInfo,
					(
						metadata[
							Object.keys(
								metadata || {},
							)[0] as keyof proto.IMessage
						] as any
					)?.contextInfo,
				),
			);
		msg.message = metadata;
		metadata = {};
		return msg;
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
			Object.keys(this.options as Whatsapp.IOptionsMessage)
				.length > 0
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
	public setContent(
		content: string | Buffer | Readable,
	): BulilderMetadata<T> {
		this.metadata.content = content;
		return this;
	}
	public setOptions(
		options: Whatsapp.IOptionsMessage,
	): BulilderMetadata<T> {
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
		content: string | Buffer | Readable,
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
		return await this.metadata.Builder();
	}
}
