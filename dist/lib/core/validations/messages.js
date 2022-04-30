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
exports.Message = void 0;
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = __importStar(require("../../utils"));
const baileys_1 = require("@adiwajshing/baileys");
const clients_1 = __importDefault(require("../clients"));
const bluebird_1 = __importDefault(require("bluebird"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../database/config"));
const fs = __importStar(require("fs"));
const node_cache_1 = __importDefault(require("node-cache"));
class Message extends clients_1.default {
    constructor(msg, sock, log) {
        super();
        this.sock = sock;
        this.log = log;
        this.db = new node_cache_1.default({
            stdTTL: 5,
        });
        this.serialize(msg);
        msg = null;
    }
    getDB(key) {
        return this.db.get(key);
    }
    serialize(msg) {
        if (msg.message?.protocolMessage)
            delete msg.message.protocolMessage;
        if (msg.message?.senderKeyDistributionMessage)
            delete msg.message.senderKeyDistributionMessage;
        if (msg.message?.messageContextInfo)
            delete msg.message.messageContextInfo;
        if (msg.key) {
            this.db.set("from", this.serializeJID(msg.key.remoteJid));
            this.db.set("isGroupMsg", this.getDB("from").endsWith("@g.us"));
            this.db.set("fromMe", msg.key.fromMe);
            this.db.set("pushName", msg.pushName);
            this.db.set("isBot", !!msg.key.id?.startsWith("R4B0T"));
            this.db.set("sender", msg.key.fromMe
                ? this.sock?.user?.id
                : this.getDB("isGroupMsg")
                    ? String(msg.key.participant)
                    : msg.key.remoteJid);
            this.db.set("sender", this.serializeJID(this.getDB("sender")));
        }
        this.db.set("message", JSON.parse(JSON.stringify(msg.message?.ephemeralMessage || msg)));
        this.db.set("id", JSON.parse(JSON.stringify(msg)));
        this.db.set("type", lodash_1.default.keys(this.getDB("message")?.message || {})[0]);
        this.db.set("botNumber", this.serializeJID(this.sock?.user?.id));
        this.db.set("ownerNumber", [
            ...config_1.default.create().config.ownerNumber,
            this.getDB("botNumber"),
        ]);
        this.db.set("realOwner", config_1.default.create().config.ownerNumber[0] || this.getDB("botNumber"));
        if (!this.getDB("message")?.message)
            return;
        if (!this.getDB("type"))
            return;
        if (lodash_1.default.has(this.getDB("message").message, `${this.getDB("type")}.contextInfo`)) {
            this.db.set("quotedMsg", lodash_1.default.get(this.getDB("message").message, `${this.getDB("type")}.contextInfo`));
            this.db.set("typeQuoted", lodash_1.default.keys(this.getDB("quotedMsg")?.quotedMessage)[0]);
        }
        let m = this.getDB("message")?.message?.[this.getDB("type")];
        if (this.getDB("quotedMsg"))
            delete m.contextInfo;
        this.db.set("body", this.getDB("message")?.message?.conversation ||
            this.getDB("message").message?.extendedTextMessage?.text ||
            utils_1.default.FindAndGet(m, "*caption") ||
            utils_1.default.FindAndGet(m, "*selectedDisplayText") ||
            utils_1.default.FindAndGet(m, "*title") ||
            utils_1.default.FindAndGet(m, "*text"));
        if (typeof this.getDB("body") === "object")
            this.db.set("body", lodash_1.default.values(this.getDB("body"))[0]);
        m = null;
        this.db.set("buttonsID", lodash_1.default.values(utils_1.default.FindAndGet(this.getDB("message")?.message, "*selectedButtonId"))[0]);
        if (this.getDB("quotedMsg"))
            this.db.set("mentioned", Number(this.getDB("quotedMsg")?.mentionedJid?.length) > 0
                ? this.getDB("quotedMsg").mentionedJid
                : this.getDB("quotedMsg")?.participant
                    ? [this.getDB("quotedMsg")?.participant]
                    : []);
        if (this.getDB("quotedMsg")?.quotedMessage) {
            this.db.set("bodyQuoted", this.getDB("quotedMsg")?.quotedMessage?.conversation ||
                utils_1.default.FindAndGet(this.getDB("quotedMsg")?.quotedMessage, "*text") ||
                utils_1.default.FindAndGet(this.getDB("quotedMsg")?.quotedMessage, "*caption") ||
                utils_1.default.FindAndGet(this.getDB("quotedMsg")?.quotedMessage, "*selectedDisplayText") ||
                utils_1.default.FindAndGet(this.getDB("quotedMsg")?.quotedMessage, "*title"));
            if (typeof this.getDB("bodyQuoted") === "object")
                this.db.set("bodyQuoted", lodash_1.default.values(this.getDB("bodyQuoted"))[0] || "");
        }
        let [command, ...args] = this.getDB("body")?.split(" ") || [];
        this.db.set("command", command?.toLowerCase());
        this.db.set("args", args);
        this.db.set("querry", this.getDB("args")?.length > 0
            ? this.getDB("args")?.join(" ")
            : this.getDB("bodyQuoted") || "");
        let mediaSupport = [
            "imageMessage",
            "videoMessage",
            "audioMessage",
            "documentMessage",
            "stickerMessage",
        ];
        if (mediaSupport.includes(this.getDB("type")) ||
            mediaSupport.includes(this.getDB("typeQuoted"))) {
            this.db.set("media", {
                type: mediaSupport.includes(this.getDB("type"))
                    ? this.getDB("type")
                    : this.getDB("typeQuoted"),
                file: lodash_1.default
                    .values(lodash_1.default.pick(mediaSupport.includes(this.getDB("type"))
                    ? this.getDB("message").message
                    : this.getDB("quotedMsg")?.quotedMessage, mediaSupport))
                    .filter((v) => !!v)[0],
                mimetype: mediaSupport.includes(this.getDB("type"))
                    ? this.getDB("message")?.message?.[this.getDB("type")]?.mimetype
                    : this.getDB("quotedMsg")?.quotedMessage[this.getDB("typeQuoted")]?.mimetype,
            });
            m = this.getDB("media");
            m.type = m.type.replace("Message", "");
            this.db.set("media", m);
            m = null;
        }
        else if (this.getDB("type") === "viewOnceMessage" ||
            this.getDB("type") === "viewOnceMessage") {
            this.db.set("media", {
                type: mediaSupport.includes(lodash_1.default.keys(this.getDB("message")?.message?.viewOnceMessage.message)[0])
                    ? lodash_1.default.keys(this.getDB("message")?.message?.viewOnceMessage.message)[0]
                    : lodash_1.default.keys(this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage?.message)[0],
                file: lodash_1.default
                    .values(lodash_1.default.pick(mediaSupport.includes(lodash_1.default.keys(this.getDB("message")?.message?.viewOnceMessage.message)[0])
                    ? this.getDB("message")?.message?.viewOnceMessage.message
                    : this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage
                        .message, mediaSupport))
                    .filter((v) => !!v)[0],
                mimetype: mediaSupport.includes(lodash_1.default.keys(this.getDB("message")?.message?.viewOnceMessage.message)[0])
                    ? this.getDB("message")?.message?.viewOnceMessage?.message?.[lodash_1.default.keys(this.getDB("message")?.message?.viewOnceMessage.message)[0]]?.mimetype
                    : this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage?.message?.[lodash_1.default.keys(this.getDB("quotedMsg")?.quotedMessage?.viewOnceMessage
                        ?.message)[0]]?.mimetype,
            });
            m = this.getDB("media");
            m.type = m.type.replace("Message", "");
            this.db.set("media", m);
            m = null;
        }
        this.db.set("isMedia", ["imageMessage", "videoMessage", "viewOnceMessage"].includes(this.getDB("type")) ||
            ["imageMessage", "videoMessage", "viewOnceMessage"].includes(this.getDB("typeQuoted")));
        this.db.set("isAudio", this.getDB("type") === "audioMessage" ||
            this.getDB("typeQuoted") === "audioMessage");
        this.db.set("isVideo", this.getDB("type") === "videoMessage" ||
            this.getDB("typeQuoted") === "videoMessage");
        this.db.set("isDocument", this.getDB("type") === "documentMessage" ||
            this.getDB("typeQuoted") === "documentMessage");
        this.db.set("isSticker", this.getDB("type") === "stickerMessage" ||
            this.getDB("typeQuoted") === "stickerMessage");
        this.db.set("isImage", this.getDB("type") === "imageMessage" ||
            this.getDB("typeQuoted") === "imageMessage");
        this.db.set("isOwner", this.getDB("ownerNumber").includes(this.getDB("sender")));
        this.db.set("prefix", (0, utils_1.checkPrefix)(utils_1.DEFAULT_PREFIX, this.getDB("command")));
    }
    async downloadMedia(media, path) {
        return new bluebird_1.default(async (resolve, reject) => {
            if (typeof media === "undefined" || typeof this.media === "undefined")
                return reject(new Error("Media not found"));
            let m = typeof media === "string" ? this.media : media;
            let Path = typeof media === "string" ? media : path;
            if (typeof Path !== "string")
                Path = path_1.default.join(__dirname, "../../database/media", crypto_1.default.randomBytes(16).toString("hex") +
                    "." +
                    m.mimetype.split("/")[1]);
            let file = await this.decryptMedia(m);
            fs.writeFile(Path, file, (err) => {
                if (err)
                    return reject(err);
                resolve(Path);
                file = null;
                m = null;
            });
        });
    }
    ParsedMentions(text) {
        return (text
            .match(/@(0|[0-9]{4,16})/g)
            ?.map((values) => values.split("@")[1] + "@s.whatsapp.net") ||
            []);
    }
    async decryptMedia(media) {
        return new bluebird_1.default(async (resolve, reject) => {
            if (typeof media === "undefined" || typeof this.media === "undefined")
                return reject(new Error("Media not found"));
            let buffer = Buffer.from([]);
            try {
                let Stream = await (0, baileys_1.downloadContentFromMessage)(media?.file ||
                    this.media?.file, media.type);
                for await (const chunk of Stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                resolve(buffer);
                Stream = null;
            }
            catch (err) {
                if (err instanceof Error)
                    reject(new Error(err.stack));
            }
            finally {
                buffer = null;
            }
        });
    }
    GetSerialize() {
        return lodash_1.default.mapValues(this.db.data, (v) => v.v);
    }
    SerializeParsed() {
        return lodash_1.default.omitBy(this.GetSerialize(), (v) => v == null || v == undefined);
    }
    serializeJID(jid) {
        if (/@g.us/gi.test(jid)) {
            return jid;
        }
        else if (/@s.whatsapp.net/gi.test(jid) && /\:/g.test(jid)) {
            return jid.split(":")[0] + "@s.whatsapp.net";
        }
        else {
            return jid;
        }
    }
    get from() {
        return this.getDB("from");
    }
    get fromMe() {
        return this.getDB("fromMe");
    }
    get pushName() {
        return this.getDB("pushName");
    }
    get id() {
        return this.getDB("id");
    }
    get realOwner() {
        return this.getDB("realOwner");
    }
    get message() {
        return this.getDB("message");
    }
    get isGroupMsg() {
        return this.getDB("isGroupMsg");
    }
    get type() {
        return this.getDB("type");
    }
    get typeQuoted() {
        return this.getDB("typeQuoted");
    }
    get quotedMsg() {
        return this.getDB("quotedMsg");
    }
    get sender() {
        return this.getDB("sender");
    }
    get botNumber() {
        return this.getDB("botNumber");
    }
    get body() {
        return this.getDB("body");
    }
    get buttonsID() {
        return this.getDB("buttonsID");
    }
    get prefix() {
        return this.getDB("prefix");
    }
    get bodyQuoted() {
        return this.getDB("bodyQuoted");
    }
    get mentioned() {
        return this.getDB("mentioned");
    }
    get command() {
        return this.getDB("command");
    }
    get args() {
        return this.getDB("args");
    }
    get querry() {
        return this.getDB("querry");
    }
    get media() {
        return this.getDB("media");
    }
    get isMedia() {
        return this.getDB("isMedia");
    }
    get isImage() {
        return this.getDB("isImage");
    }
    get isVideo() {
        return this.getDB("isVideo");
    }
    get isAudio() {
        return this.getDB("isAudio");
    }
    get isDocument() {
        return this.getDB("isDocument");
    }
    get isSticker() {
        return this.getDB("isSticker");
    }
    get ownerNumber() {
        return this.getDB("ownerNumber");
    }
    get isOwner() {
        return this.getDB("isOwner");
    }
    get isBot() {
        return this.getDB("isBot");
    }
}
exports.Message = Message;
