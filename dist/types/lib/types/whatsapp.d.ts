/// <reference types="node" />
import type { proto, WASocket } from "@adiwajshing/baileys";
import type { $Values } from "utility-types";
import type { MimeType } from "file-type";
import type { Readable } from "stream";
import type Logger from "../log";
import type Builder from "../core/cli";
import { Prefix } from ".";
export declare namespace Whatsapp {
    interface EventsOperator {
        readonly operator: () => void;
        readonly setUtils: (logger: Logger) => void;
    }
    interface SerializeMessage {
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
        prefix: Prefix | undefined;
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
        realOwner: string;
        isBot: boolean;
        decryptMedia(media?: IMedia): Promise<Buffer>;
        ParsedMentions(text: string): Array<string>;
        downloadMedia(media: IMedia, path?: string): Promise<string>;
        downloadMedia(path?: string): Promise<string>;
        downloadMedia(media?: IMedia | string, path?: string): Promise<string>;
        GetSerialize(): SerializeMessage;
        SerializeParsed(): SerializeMessage;
        serializeJID(jid: string): string;
    }
    interface IClient {
        Generate(from: string, content: string | Buffer | Readable, type: keyof Whatsapp.ContentData, options?: Whatsapp.IOptionsMessage): Promise<proto.WebMessageInfo>;
        Generate(): Builder<proto.IMessage>;
        Generate(from?: string, content?: string | Buffer | Readable, type?: keyof Whatsapp.ContentData, options?: Whatsapp.IOptionsMessage): Builder<proto.IMessage> | Promise<proto.WebMessageInfo>;
        sendFile(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage & {
            isDocs?: boolean;
        }): Promise<proto.IWebMessageInfo | void>;
        wait(from: string, id: proto.IWebMessageInfo): Promise<proto.WebMessageInfo | void>;
        sendText(from: string, content: string): Promise<proto.WebMessageInfo | void>;
        sendTextWithMentions(from: string, content: string, id?: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo | void>;
        reply(from: string, content: string, id?: proto.IWebMessageInfo): Promise<proto.WebMessageInfo | void>;
        sendButtons(from: string, content: Whatsapp.ButtonsContent, options?: Whatsapp.MetadataDefault): Promise<proto.WebMessageInfo>;
        sendDocument(from: string, content: string | Buffer | Readable, options: Whatsapp.MetadataDocument): Promise<proto.WebMessageInfo>;
        sendContact(from: string, content: Whatsapp.ContactsContent, ctx?: proto.IContextInfo): Promise<proto.IWebMessageInfo>;
        sendAudio(from: string, content: string | Buffer | Readable, options?: Whatsapp.MetadataAudio): Promise<proto.WebMessageInfo>;
        sendSticker(from: string, content: string | Buffer | Readable, options?: Whatsapp.MetadataSticker): Promise<proto.WebMessageInfo>;
        sendVideo(from: string, content: string | Buffer | Readable, options?: Whatsapp.MetadataVideo): Promise<proto.WebMessageInfo>;
        sendImage(from: string, content: string | Buffer | Readable, options?: Whatsapp.MetadataImage): Promise<proto.WebMessageInfo>;
        prepareMessage(from: string, content: proto.IMessage, options?: Whatsapp.IOptionsParams): Promise<proto.IWebMessageInfo>;
        relayMessage(content: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo>;
        sock: WASocket;
    }
    type ClientType = IClient & SerializeMessage;
    interface TypeRequired {
        API?: boolean;
        utils?: boolean;
        logger?: boolean;
        request?: boolean;
        ev?: boolean;
    }
    interface IButtons {
        buttonId?: string;
        buttonText: string;
        type?: proto.Button.ButtonType;
        nativeFlowInfo?: proto.INativeFlowInfo;
    }
    interface ButtonsContent {
        contentText?: string;
        footerText?: string;
        buttons: IButtons[];
        headerType?: proto.ButtonsMessage.ButtonsMessageHeaderType;
        text?: string;
        media?: string | Buffer | Readable;
        locations?: proto.ILocationMessage;
        isDocs?: boolean;
    }
    interface ContactsContent {
        name: string;
        phone: string;
    }
    type MediaSupport = "imageMessage" | "videoMessage" | "audioMessage" | "documentMessage" | "stickerMessage";
    interface IMedia {
        type: string;
        file: $Values<Pick<proto.IMessage, MediaSupport>>;
        mimetype: MimeType;
    }
    interface IOptionsMessage {
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
        mentioned?: Array<string>;
    }
    interface ContentData {
        image: string | Buffer | Readable;
        video: string | Buffer | Readable;
        sticker: string | Buffer | Readable;
        document: string | Buffer | Readable;
        audio: string | Buffer | Readable;
        text: string;
        buttons: ButtonsContent;
    }
    interface MetadataDefault {
        quoted?: proto.IWebMessageInfo;
        contextInfo?: proto.IContextInfo;
        mimetype?: MimeType;
    }
    interface MetadataImage extends MetadataDefault {
        caption?: string;
        jpegThumbnail?: Buffer | string;
        viewOnce?: boolean;
        isMentions?: boolean;
    }
    type MetadataVideo = MetadataImage;
    type MetadataSticker = MetadataDefault;
    interface MetadataAudio extends MetadataDefault {
        ptt?: boolean;
        seconds?: number;
    }
    interface MetadataDocument extends MetadataDefault {
        mimetype: MimeType;
        fileName?: string;
    }
    interface IOptionsParams {
        quoted?: proto.IWebMessageInfo;
        messageId?: string;
        viewOnce?: boolean;
        userJid?: string;
    }
    interface MyEvents {
        command: string | Array<string | RegExp> | RegExp;
        isGroupMsg: boolean;
        help: Array<string> | string;
        costumePrefix: TypeCostumePrefix;
        open: boolean;
        enable: boolean;
        eventName: string;
        group: string;
        isOwner: boolean;
        isMedia: boolean;
        errorHandle: Partial<IErrorHandling>;
        cmdInfo: string;
        description: string;
        isQuerry: boolean;
    }
    interface AddEvents {
        utils?: boolean;
        request?: boolean;
        logger?: boolean;
        API?: boolean;
        optionsFunc?: any;
        ev?: boolean;
    }
    interface IErrorHandling {
        autoDisable: boolean;
        attempts: number;
        ownerCall: boolean;
        warningUser: boolean;
    }
    type CommandDefault = MyCmd & MyCommand;
    type CommandEvents = CommandDefault & MyEvents;
    interface MyCmd {
        execute(data: Whatsapp.ClientType): any;
    }
    interface MyCommand {
        run(data: Whatsapp.ClientType): any;
    }
    interface TypeCostumePrefix {
        isPrefix?: boolean;
        prefix?: string | Array<string | RegExp> | RegExp;
    }
}
