import type {proto} from "@adiwajshing/baileys";
import type {$Values} from "utility-types";
import type {MimeType} from "file-type";
import type {Readable} from "stream";
import type Logger from "../log";
import type Builder from "../core/cli";

export namespace Whatsapp {
	export interface EventsOperator {
		readonly operator: () => void;
		readonly setUtils: (logger: Logger) => void;
	}
	export interface SerializeMessage {
		from: string;
		fromMe: boolean;
		pushName: string;
		id: proto.IWebMessageInfo;
		message: proto.IFutureProofMessage;
		isGroupMsg: boolean;
		type: keyof proto.IMessage;
		typeQuoted: keyof proto.IMessage;
		quotedMsg: proto.IContextInfo;
		sender: string;
		botNumber: string;
		body: string;
		buttonsID: string;
		bodyQuoted: string | null;
		mentioned: Array<string>;
		command: string;
		args: Array<string>;
		querry: string;
		media: IMedia | null;
		isMedia: boolean;
		isImage: boolean;
		isVideo: boolean;
		isAudio: boolean;
		isDocument: boolean;
		isSticker: boolean;
		ownerNumber: Array<string>;
		isOwner: boolean;
	}
	export interface IClient {
		Generate(
			from: string,
			content: string | Buffer | Readable,
			type: keyof Whatsapp.ContentData,
			options?: Whatsapp.IOptionsMessage,
		): Promise<proto.WebMessageInfo>;
		Generate(): Builder<proto.IMessage>;
		Generate(
			from?: string,
			content?: string | Buffer | Readable,
			type?: keyof Whatsapp.ContentData,
			options?: Whatsapp.IOptionsMessage,
		): Builder<proto.IMessage> | Promise<proto.WebMessageInfo>;
		sendFile(
			from: string,
			content: string | Buffer | Readable,
			options?: Whatsapp.IOptionsMessage & {isDocs?: boolean},
		): Promise<proto.IWebMessageInfo | void>;
		sendText(
			from: string,
			content: string,
		): Promise<proto.WebMessageInfo | void>;
		reply(
			from: string,
			content: string,
			id?: proto.IWebMessageInfo,
		): Promise<proto.WebMessageInfo | void>;
		sendDocument(
			from: string,
			content: string | Buffer | Readable,
			options: Whatsapp.MetadataDocument,
		): Promise<proto.WebMessageInfo>;
		sendAudio(
			from: string,
			content: string | Buffer | Readable,
			options?: Whatsapp.MetadataAudio,
		): Promise<proto.WebMessageInfo>;
		sendSticker(
			from: string,
			content: string | Buffer | Readable,
			options?: Whatsapp.MetadataSticker,
		): Promise<proto.WebMessageInfo>;
		sendVideo(
			from: string,
			content: string | Buffer | Readable,
			options?: Whatsapp.MetadataVideo,
		): Promise<proto.WebMessageInfo>;
		sendImage(
			from: string,
			content: string | Buffer | Readable,
			options?: Whatsapp.MetadataImage,
		): Promise<proto.WebMessageInfo>;
		prepareMessage(
			from: string,
			content: proto.IMessage,
			options?: Whatsapp.IOptionsParams,
		): Promise<proto.IWebMessageInfo>;
		relayMessage(
			content: proto.IWebMessageInfo,
		): Promise<proto.IWebMessageInfo>;
	}
	export type ClientType = IClient & SerializeMessage;

	export interface TypeRequired {
		api?: boolean;
		utils?: boolean;
		logger?: boolean;
		request?: boolean;
	}
	export type MediaSupport =
		| "imageMessage"
		| "videoMessage"
		| "audioMessage"
		| "documentMessage"
		| "stickerMessage";
	export interface IMedia {
		type: string;
		file: $Values<Pick<proto.IMessage, MediaSupport>>;
		mimetype: MimeType;
	}
	export interface IOptionsMessage {
		extendedInfo?: proto.IExtendedTextMessage;
		mimetype?: MimeType;
		fileName?: string;
		contextInfo?: proto.IContextInfo;
		quoted?: proto.IWebMessageInfo;
		externalAdReplyInfo?: proto.IExternalAdReplyInfo;
		jpegThumbnail?: string | Buffer;
		viewOnce?: boolean;
		caption?: string;
		ptt?: boolean;
		seconds?: number;
	}
	export interface ContentData {
		image: string | Buffer | Readable;
		video: string | Buffer | Readable;
		sticker: string | Buffer | Readable;
		document: string | Buffer | Readable;
		audio: string | Buffer | Readable;
		text: string;
	}
	export interface MetadataDefault {
		quoted?: proto.IWebMessageInfo;
		contextInfo?: proto.IContextInfo;
		mimetype?: MimeType;
	}
	export interface MetadataImage extends MetadataDefault {
		caption?: string;
		jpegThumbnail?: Buffer | string;
		viewOnce?: boolean;
		isMentions?: boolean;
	}
	export type MetadataVideo = MetadataImage;
	export type MetadataSticker = MetadataDefault;
	export interface MetadataAudio extends MetadataDefault {
		ptt?: boolean;
		seconds?: number;
	}
	export interface MetadataDocument extends MetadataDefault {
		mimetype: MimeType;
		fileName?: string;
	}
	export interface IOptionsParams {
		quoted?: proto.IWebMessageInfo;
		messageId?: string;
		viewOnce?: boolean;
		userJid?: string;
	}

	export interface MyEvents {
		command: string | Array<string | RegExp> | RegExp;
		isGroupMsg: boolean;
		help: Array<string> | string;
		costumePrefix: TypeCostumePrefix;
		open: boolean;
		enable: boolean;
		eventName: string;
		group: string;
		isOwner: boolean;
	}
	export type CommandDefault = MyCmd & MyCommand;
	export type CommandEvents = CommandDefault & MyEvents;
	export interface MyCmd {
		execute(data: Whatsapp.ClientType): any;
	}
	export interface MyCommand {
		run(data: Whatsapp.ClientType): any;
	}
	export interface TypeCostumePrefix {
		isPrefix?: boolean;
		prefix?: string | Array<string | RegExp> | RegExp;
	}
}
