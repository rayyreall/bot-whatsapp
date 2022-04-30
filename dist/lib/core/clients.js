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
const bluebird_1 = __importDefault(require("bluebird"));
const cli_1 = __importDefault(require("./cli"));
const utils_1 = __importStar(require("../utils"));
const file_type_1 = __importDefault(require("file-type"));
const baileys_1 = require("@adiwajshing/baileys");
const awesome_phonenumber_1 = __importDefault(require("awesome-phonenumber"));
class Client {
    constructor() { }
    Generate(from, content, type, options) {
        if (from && content && type) {
            return new bluebird_1.default(async (resolve) => {
                let m = new cli_1.default(this.sock);
                m.create(String(from), content, type, options);
                resolve(await m.build().catch((err) => this?.log?.error(err)));
            });
        }
        return new cli_1.default(this.sock);
    }
    sendFile(from, content, options = {}) {
        return new bluebird_1.default(async (resolve) => {
            let m;
            let file = await (0, utils_1.toBuffer)(content);
            try {
                if (!file)
                    return void this?.log?.error("Your file is undefined");
                let types = await file_type_1.default.fromBuffer(file);
                if (!types)
                    return void this?.log?.error("Your file is undefined");
                let type = this.ParseExtentions(types.mime)?.type;
                if (!type)
                    return void this?.log?.error("Your file is undefined");
                if (typeof options.mimetype == "undefined")
                    options.mimetype = types.mime;
                if (options.isDocs)
                    type = "document";
                switch (type) {
                    case "image":
                        m = await this.sendImage(from, file, options);
                        break;
                    case "video":
                        m = await this.sendVideo(from, file, options);
                        break;
                    case "audio":
                        m = await this.sendAudio(from, file, options);
                        break;
                    case "document":
                        m = await this.sendDocument(from, file, options);
                        break;
                    case "sticker":
                        m = await this.sendSticker(from, file, options);
                        break;
                    default:
                        return void this?.log?.error("Your file is undefined");
                }
                resolve(m);
                m = {};
                file = null;
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
        });
    }
    async sendText(from, content) {
        return bluebird_1.default.try(async () => {
            let m = await this.Generate(from, content, "text");
            await this.relayMessage(m);
            return m;
        }).catch((err) => this?.log?.error(err));
    }
    async sendTextWithMentions(from, content, id) {
        return bluebird_1.default.try(async () => {
            let m = await this.Generate(from, content, "text", {
                mentioned: this.ParsedMentions(content),
                quoted: id
            });
            await this.relayMessage(m);
            return m;
        }).catch((err) => this?.log?.error(err));
    }
    async reply(from, content, id) {
        return bluebird_1.default.try(async () => {
            let m = await this.Generate(from, content, "text", {
                quoted: id,
            });
            await this.relayMessage(m);
            return m;
        }).catch((err) => this?.log?.error(err));
    }
    async wait(from, id) {
        return await this.reply(from, "*⌛* Mohon tunggu sebentar bot sedang melaksanakan perintah", id);
    }
    async sendDocument(from, content, options) {
        return new bluebird_1.default(async (resolve) => {
            let file = await (0, utils_1.toBuffer)(content);
            let m;
            try {
                if (!file)
                    return void this?.log?.error("Your document is undefined");
                m = await this.Generate(from, file, "document", options);
                await this.relayMessage(m);
                resolve(m);
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
            finally {
                file = null;
                options = {};
                m = {};
            }
        });
    }
    async sendAudio(from, content, options = {}) {
        return new bluebird_1.default(async (resolve) => {
            let file = await (0, utils_1.toBuffer)(content);
            let m;
            try {
                if (!file)
                    return void this?.log?.error("Your audio is undefined");
                m = await this.Generate(from, file, "audio", options);
                await this.relayMessage(m);
                resolve(m);
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
            finally {
                file = null;
                options = {};
                m = {};
            }
        });
    }
    static ParseExtentions(mimeType) {
        if (mimeType.startsWith("application") || mimeType.startsWith("font")) {
            return { type: "document", ext: mimeType.split("/")[1] };
        }
        else if (mimeType.startsWith("image")) {
            if (mimeType === "image/webp")
                return { type: "sticker", ext: "webp" };
            else
                return { type: "image", ext: mimeType.split("/")[1] };
        }
        else if (mimeType.startsWith("video")) {
            return { type: "video", ext: mimeType.split("/")[1] };
        }
        else if (mimeType.startsWith("audio")) {
            return { type: "audio", ext: mimeType.split("/")[1] };
        }
    }
    ParseExtentions(mimeType) {
        return Client.ParseExtentions(mimeType);
    }
    async sendSticker(from, content, options = {}) {
        return new bluebird_1.default(async (resolve) => {
            let file = await (0, utils_1.toBuffer)(content);
            let m;
            try {
                if (!file)
                    return void this?.log?.error("Your sticker is undefined");
                m = await this.Generate(from, file, "sticker", options);
                await this.relayMessage(m);
                resolve(m);
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
            finally {
                file = null;
                options = {};
                m = {};
            }
        });
    }
    async sendContact(from, content, ctx) {
        let ph = new awesome_phonenumber_1.default(content.phone);
        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${content.name}
TEL;type=CELL;type=VOICE;waid=${content.phone}:${ph.getNumber("international")}
END:VCARD
`;
        return await this.relayMessage(await this.prepareMessage(from, baileys_1.proto.Message.fromObject({
            contactMessage: baileys_1.proto.ContactMessage.fromObject({
                displayName: content.name,
                vcard,
                ...ctx ? { contextInfo: ctx } : {}
            })
        })));
    }
    async sendButtons(from, content, options) {
        return new bluebird_1.default(async (resolve) => {
            let m;
            try {
                m = await this.Generate(from, content, "buttons", options);
                await this.relayMessage(m);
                resolve(m);
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
            finally {
                content = {};
                m = {};
            }
        });
    }
    async sendVideo(from, content, options = {}) {
        return new bluebird_1.default(async (resolve) => {
            let file = await (0, utils_1.toBuffer)(content);
            let m;
            try {
                if (!file)
                    return void this?.log?.error("Your video is undefined");
                if (options.isMentions) {
                    utils_1.default.setObject(options, "contextInfo.mentionedJid", this.ParsedMentions(from));
                    delete options.isMentions;
                }
                if (typeof options.jpegThumbnail == "undefined")
                    options.jpegThumbnail = await (0, utils_1.compressImage)(file);
                m = await this.Generate(from, file, "video", options);
                await this.relayMessage(m);
                resolve(m);
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
            finally {
                file = null;
                options = {};
                m = {};
            }
        });
    }
    async sendImage(from, content, options = {}) {
        return new bluebird_1.default(async (resolve) => {
            let file = await (0, utils_1.toBuffer)(content);
            let m;
            try {
                if (!file)
                    return void this?.log?.error("Your image is undefined");
                if (options.isMentions) {
                    utils_1.default.setObject(options, "contextInfo.mentionedJid", this.ParsedMentions(from));
                    delete options.isMentions;
                }
                if (typeof options.jpegThumbnail == "undefined")
                    options.jpegThumbnail = await (0, utils_1.compressImage)(file);
                m = await this.Generate(from, file, "image", options);
                await this.relayMessage(m);
                resolve(m);
            }
            catch (err) {
                if (err instanceof Error) {
                    this?.log?.error(err.message);
                }
            }
            finally {
                file = null;
                options = {};
                m = {};
            }
        });
    }
    async prepareMessage(from, content, options = {}) {
        return new bluebird_1.default(async (resolve) => {
            if (!("userJid" in options))
                options.userJid = this.sock.authState.creds.me.id;
            if (!("messageId" in options))
                options.messageId = (0, utils_1.GenerateID)();
            if (typeof options.viewOnce == "boolean" &&
                content.viewOnceMessage?.message) {
                utils_1.default.FindAndSet(content, "viewOnceMessage.message*.viewOnce", options.viewOnce);
            }
            else if (typeof options.viewOnce == "boolean") {
                content = {
                    viewOnceMessage: baileys_1.proto.FutureProofMessage.fromObject({
                        message: content,
                    }),
                };
            }
            let m = (0, baileys_1.generateWAMessageFromContent)(from, content, {
                messageId: (0, utils_1.GenerateID)(),
                userJid: options.userJid,
                ...options,
            });
            resolve(m);
            m = undefined;
            content = null;
        });
    }
    async relayMessage(content) {
        return new bluebird_1.default(async (resolve) => {
            try {
                if (!content.key)
                    return void this?.log?.error("Your key WebMessageInfo is undefined");
                await this.sock.relayMessage(String(content.key.remoteJid), content.message, { messageId: content.key.id || (0, utils_1.GenerateID)() });
                resolve(content);
                content = null;
            }
            catch (e) {
                if (e instanceof Error) {
                    this?.log?.error(e.message);
                }
            }
        });
    }
}
exports.default = Client;
