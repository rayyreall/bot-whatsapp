"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const baileys_1 = require("@adiwajshing/baileys");
const node_cache_1 = __importDefault(require("node-cache"));
const utils_1 = __importStar(require("../utils"));
const file_type_1 = __importDefault(require("file-type"));
const clients_1 = __importDefault(require("./clients"));
class createMetadata {
    constructor(sock) {
        this.sock = sock;
        this.mediaType = ["image", "video", "audio", "document", "sticker"];
    }
    async Builder() {
        let msg;
        let metadata;
        if (!this.options)
            this.options = {};
        if (this.keyName == "buttons") {
            let m = {};
            this.content = this.content;
            m.buttons = this.content.buttons.map((button) => {
                return {
                    buttonId: button.buttonId,
                    buttonText: {
                        displayText: button.buttonText
                    },
                    type: button.type,
                    ...button.nativeFlowInfo ? { nativeFlowInfo: button.nativeFlowInfo } : {}
                };
            });
            m.headerType = this.content.headerType;
            m.contentText = this.content.contentText;
            m.footerText = this.content.footerText;
            if (typeof this.content.text == "string")
                m.text = this.content.text;
            if (m.headerType == 4) {
                m.imageMessage = (await new BulilderMetadata(this.sock).createImage(this.from, this.content.media).build()).message?.imageMessage;
            }
            else if (m.headerType == 5) {
                m.videoMessage = (await new BulilderMetadata(this.sock).createVideo(this.from, this.content.media).build()).message?.videoMessage;
            }
            else if (m.headerType == 6) {
                m.locationMessage = this.content.locations;
            }
            else if (m.headerType == 3) {
                m.documentMessage = (await new BulilderMetadata(this.sock).createDocument(this.from, this.content.media).build()).message?.documentMessage;
            }
            metadata = {
                [`buttonsMessage`]: baileys_1.proto.ButtonsMessage.fromObject(m)
            };
            this.keyName = "buttonsMessage";
            m = {};
            if (this.options.jpegThumbnail)
                utils_1.default.FindAndSet(metadata, String(`*jpegThumbnail`), this.options.jpegThumbnail);
            if (this.options.quoted)
                this.options.contextInfo = Object.assign(this.options.contextInfo ? this.options.contextInfo : {}, { quotedMessage: this.options.quoted });
            if (this.options.contextInfo) {
                let ctx;
                if (!utils_1.default.FindHas(metadata, "*contextInfo")) {
                    utils_1.default.setObject(metadata, `${this.keyName}.contextInfo`, {});
                }
                else {
                    ctx = utils_1.default.FindAndGet(metadata, String(`*contextInfo`));
                }
                utils_1.default.FindAndSet(metadata, `*contextInfo`, Object.assign(ctx ? ctx : {}, this.options.contextInfo, this.options.externalAdReplyInfo
                    ? {
                        externalAdReply: this.options.externalAdReplyInfo,
                    }
                    : {}));
                ctx = {};
            }
            msg = (0, baileys_1.generateWAMessageFromContent)(this.from, metadata, {
                userJid: this.sock.authState.creds.me.id,
                messageId: (0, utils_1.GenerateID)(),
                quoted: this.options.quoted ? this.options.quoted : undefined,
            });
            msg.message = metadata;
            metadata = {};
            return msg;
        }
        else {
            this.ParseType();
            if (this.keyName == "conversation" ||
                this.keyName == "extendedTextMessage") {
                metadata = {
                    [this.keyName]: this.keyName == "conversation"
                        ? this.content
                        : {
                            text: this.content,
                            ...this.options.extendedInfo,
                        },
                };
            }
            else {
                metadata = {
                    [this.keyName]: {
                        ...(await (0, baileys_1.generateWAMessage)(String(this.from), {
                            [this.keyName?.replace("Message", "")]: await this.ParseContent(),
                        }, {
                            userJid: this.sock.authState.creds.me.id,
                            upload: this.sock.waUploadToServer,
                            messageId: (0, utils_1.GenerateID)(),
                        }).catch((e) => {
                            throw e;
                        }))?.message?.[this.keyName],
                    },
                };
            }
            if (this.options.viewOnce &&
                ["imageMessage", "videoMessage"].includes(String(this.keyName))) {
                utils_1.default.FindAndSetWithPath(metadata, String(`*${this.keyName}`), "viewOnce", true);
                if (this.options.caption)
                    utils_1.default.FindAndSetWithPath(metadata, String(`*${this.keyName}`), "caption", this.options.caption);
                metadata = {
                    viewOnceMessage: baileys_1.proto.FutureProofMessage.fromObject({
                        message: baileys_1.proto.Message.fromObject({
                            ...utils_1.default.FindAndGet(metadata, String(`*${this.keyName}`)),
                        }),
                    }),
                };
            }
            if (metadata.audioMessage) {
                if (this.options.ptt)
                    metadata.audioMessage.ptt = true;
                if (this.options.seconds)
                    metadata.audioMessage.seconds = this.options.seconds;
            }
            if (this.options.jpegThumbnail)
                utils_1.default.FindAndSet(metadata, String(`*${this.keyName}.jpegThumbnail`), this.options.jpegThumbnail);
            if (this.options.quoted)
                this.options.contextInfo = Object.assign(this.options.contextInfo ? this.options.contextInfo : {}, { quotedMessage: this.options.quoted });
            if (this.options.fileName && metadata.documentMessage)
                metadata.documentMessage.fileName = this.options.fileName;
            if (this.options.mimetype)
                utils_1.default.FindAndSet(metadata, String(`*${this.keyName}.mimetype`), this.options.mimetype);
            if (this.options.contextInfo) {
                let ctx;
                if (!utils_1.default.FindHas(metadata, "*contextInfo")) {
                    utils_1.default.setObject(metadata, `${this.keyName}.contextInfo`, {});
                }
                else {
                    ctx = utils_1.default.FindAndGet(metadata, String(`*contextInfo`));
                }
                utils_1.default.FindAndSet(metadata, `*contextInfo`, Object.assign(ctx ? ctx : {}, this.options.contextInfo, this.options.externalAdReplyInfo
                    ? {
                        externalAdReply: this.options.externalAdReplyInfo,
                    }
                    : {}));
                ctx = {};
            }
            msg = (0, baileys_1.generateWAMessageFromContent)(String(this.from), metadata, {
                userJid: this.sock.authState.creds.me.id,
                messageId: (0, utils_1.GenerateID)(),
                quoted: this.options.quoted ? this.options.quoted : undefined
            });
            if (this.options.contextInfo)
                utils_1.default.setObject(metadata, `${Object.keys(metadata)[0]}.contextInfo`, Object.assign(msg.message?.[Object.keys(msg.message || {})[0]]?.contextInfo, metadata[Object.keys(metadata || {})[0]]?.contextInfo));
            if (this.options.mentioned)
                utils_1.default.FindAndSetWithPath(metadata, "*contextInfo", "mentionedJid", this.options.mentioned, true);
            msg.message = metadata;
            metadata = {};
            return msg;
        }
    }
    async ParseContent() {
        const cache = new node_cache_1.default({
            stdTTL: 6,
        });
        if (Buffer.isBuffer(this.content)) {
            cache.set("content", this.content);
        }
        else if (this.content instanceof stream_1.Readable) {
            cache.set("content", {
                stream: this.content,
            });
        }
        else if (typeof this.content == "string") {
            cache.set("content", await (0, utils_1.toBuffer)(this.content));
        }
        else {
            throw new Error("Your content is not valid");
        }
        return cache.get("content");
    }
    ParseType() {
        if (this.mediaType.includes(String(this.keyName))) {
            this.keyName = `${this.keyName}Message`;
        }
        else if (this.keyName === "text" &&
            Object.keys(this.options).length > 0) {
            this.keyName = "extendedTextMessage";
        }
        else if (this.keyName == "text") {
            this.keyName = "conversation";
        }
        else {
            throw new Error("Your key is not valid");
        }
    }
}
class BulilderMetadata {
    constructor(sock) {
        this.sock = sock;
        this.metadata = new createMetadata(this.sock);
    }
    setImage() {
        this.metadata.keyName = "image";
        return this;
    }
    setVideo() {
        this.metadata.keyName = "video";
        return this;
    }
    setProto(name) {
        this.metadata.keyName = name;
        return this;
    }
    setAudio() {
        this.metadata.keyName = "audio";
        return this;
    }
    setSticker() {
        this.metadata.keyName = "sticker";
        return this;
    }
    setButtons() {
        this.metadata.keyName = "buttons";
        return this;
    }
    setDocument() {
        this.metadata.keyName = "document";
        return this;
    }
    setText() {
        this.metadata.keyName = "text";
        return this;
    }
    setFrom(from) {
        this.metadata.from = from;
        return this;
    }
    setContent(content) {
        this.metadata.content = content;
        return this;
    }
    setOptions(options) {
        this.metadata.options = options;
        return this;
    }
    createImage(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "image";
        return this;
    }
    createVideo(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "video";
        return this;
    }
    createAudio(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "audio";
        return this;
    }
    createButtons(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "buttons";
        return this;
    }
    createSticker(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "sticker";
        return this;
    }
    createDocument(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "document";
        return this;
    }
    createText(from, content, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = "text";
        return this;
    }
    create(from, content, type, options) {
        this.metadata.from = from;
        this.metadata.content = content;
        this.metadata.options = options ? options : this.metadata.options;
        this.metadata.keyName = type;
        return this;
    }
    async build() {
        if (typeof this.metadata.keyName == "undefined")
            throw new Error("You must set a type of message");
        if (typeof this.metadata.from == "undefined")
            throw new Error("You must set a from");
        if (typeof this.metadata.content == "undefined")
            throw new Error("You must set a content");
        if (this.metadata.keyName == "buttons") {
            if (typeof this.metadata.content == "object") {
                if (!Array.isArray(this.metadata.content.buttons))
                    throw new Error("You must set Buttons Array type");
                if (this.metadata.content.buttons.length == 0)
                    throw new Error("You must set a buttons");
                else {
                    this.metadata.content.buttons = this.metadata.content.buttons.map((value) => {
                        return { buttonId: value.buttonId || "1", type: value.type || 1, buttonText: value.buttonText };
                    });
                }
                if (typeof this.metadata.content.media !== "undefined")
                    this.metadata.content.media = await (0, utils_1.toBuffer)(this.metadata.content.media);
                if (typeof this.metadata.content.locations !== "undefined" && typeof this.metadata.content.headerType == "undefined")
                    this.metadata.content.headerType = 6;
                if (typeof this.metadata.content.headerType == undefined) {
                    if (typeof this.metadata.content.media == "undefined")
                        this.metadata.content.headerType = 0;
                    else if (typeof this.metadata.content.isDocs)
                        this.metadata.content.headerType = 3;
                    else {
                        let mime = await file_type_1.default.fromBuffer(this.metadata.content.media);
                        if (typeof mime == "undefined")
                            throw new Error("Cannot Extract Your Type");
                        mime = clients_1.default.ParseExtentions(mime.mime);
                        if (typeof mime == "undefined")
                            throw new Error("Cannot Extract Your Type");
                        if (mime.type == "document")
                            this.metadata.content.headerType = 3;
                        else if (mime.type == "image")
                            this.metadata.content.headerType = 4;
                        else if (mime.type == "video")
                            this.metadata.content.headerType = 5;
                        else
                            throw new Error("Cannot Extract Your Type");
                    }
                }
            }
        }
        return await this.metadata.Builder();
    }
}
exports.default = BulilderMetadata;
