"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@adiwajshing/baileys");
const main_1 = __importDefault(require("./main"));
const validations_1 = require("./validations");
const types_1 = require("../types");
const utils_1 = require("../utils");
const events_1 = require("../events");
const os_1 = __importDefault(require("os"));
const config_1 = __importDefault(require("../database/config"));
let memoryFirst;
let memoryStatus = {
    low: 1,
    warn: 0,
    medium: 0,
    leak: 0,
    danger: 0
};
class Events {
    constructor(sock, saveState, sessions) {
        this.sock = sock;
        this.saveState = saveState;
        this.sessions = sessions;
        this.operator = () => {
            this.sock.ev.on("creds.update", this.saveState);
            this.sock.ev.on("connection.update", this.checkConnections);
            this.sock.ev.on("messages.upsert", this.messageHandler);
            this.sock.ev.on("new-message", this.newMsg);
            //process.on("message", this.checkProcess);
        };
        this.setUtils = (logger) => {
            this.log = logger;
        };
        this.checkProcess = async (data) => {
            if (typeof data === "object") {
                if (data.id === "success.write.id") {
                }
                if (data.id === "getdb") {
                    await this.sock.sendMessage(data.from, { text: data.content }, { quoted: data.quoted, messageId: (0, utils_1.GenerateID)() });
                }
            }
        };
        this.checkConnections = (connections) => {
            if (connections.connection === "close") {
                if (connections.lastDisconnect?.error?.output?.statusCode !==
                    baileys_1.DisconnectReason.loggedOut) {
                    (0, main_1.default)(this.sessions, this.log);
                }
                else {
                    this.log.error("Logged out");
                    process.exit(1);
                }
            }
        };
        this.messageHandler = (mess) => {
            if (mess.messages?.[0]?.message)
                this.sock.ev.emit("new-message", new validations_1.Message(mess.messages[0], this.sock, this.log));
        };
        this.check = (client) => {
            const { prefix, isOwner, from, id } = client;
            if (!prefix?.isMatch)
                return false;
            let event = events_1.Events.getEvents().setToArrayEvents();
            let cmd = event.filter(x => x.enable && x.costumePrefix.isPrefix && x.execute);
            if (!isOwner)
                cmd = cmd.filter(x => !x.isOwner);
            cmd = cmd.map(x => {
                if (typeof x.help == "string")
                    return x.help;
                if (Array.isArray(x.help)) {
                    for (let index of x.help) {
                        if (typeof index == "string")
                            return index;
                    }
                }
                if (typeof x.command == "string")
                    return x.command;
                if (Array.isArray(x.command)) {
                    for (let index of x.command) {
                        if (typeof index == "string")
                            return index;
                    }
                }
            }).filter(x => !!x);
            let result = (0, utils_1.checkMatch)(prefix.body, cmd);
            if (result.length > 0 && !result.map((value) => value.find((v) => v == 100.00))?.[0]) {
                let text = "*「❗」* Maaf kak, Perintah ini tidak dapat digunakan karena perintah tersebut tidak ditemukan, Mungkin Maksud anda adalah\n";
                let number = 1;
                for (const value of result) {
                    text += `\n\n${number++}. *${prefix.prefix} ${value[0]}* Dengan Rasio Keakuratan *${value[1]}%*`;
                }
                text += `\n\nKetik *${prefix.prefix}menu* Untuk melihat daftar perintah yang tersedia`;
                client.reply(from, text, id);
                return true;
            }
            else
                return false;
        };
        this.newMsg = async (mess) => {
            if (!mess.isOwner && config_1.default.create().config.memory !== "low")
                return;
            if (!memoryFirst)
                memoryFirst = (Math.round(((os_1.default.freemem() / (1024 * 1024)) * 100)) / 100);
            if (this.check(mess))
                return;
            await events_1.Events.getEvents().commandCall(mess, async (message) => {
                let { from, id, realOwner } = message;
                //Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
                process?.send?.({ id: "write-keydb", data: JSON.stringify(message.GetSerialize(), null, 2) });
                if ((Math.round(((os_1.default.freemem() / (1024 * 1024)) * 100)) / 100) < (0, utils_1.persen)(Number(memoryFirst), 95) && memoryStatus.danger == 0) {
                    memoryStatus.danger = 1;
                    process.env.memory = "danger";
                    let { from, id } = message;
                    this.log.warn(`Penggunaan memory anda telah mencapai 95% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
                    if (message.prefix?.isMatch)
                        await message.reply(from, `*「⚠️」* Bot berada dalam mode *danger* bot otomatis dimatikan sampai owner menghidupkan bot kembali`, id);
                    await message.sendText(from, "*「⚠️」* Memori anda sedang mencapai batas yang ditentukan proses otomatis akan di matikan");
                    process.send?.({ id: "memory-danger" });
                }
                if ((Math.round(((os_1.default.freemem() / (1024 * 1024)) * 100)) / 100) < (0, utils_1.persen)(Number(memoryFirst), 75) && memoryStatus.leak == 0) {
                    memoryStatus.leak = 1;
                    process.env.memory = "leak";
                    let ev = events_1.Events.getEvents();
                    ev.clear();
                    config_1.default.create().Set({ memory: "leak" });
                    this.log.warn(`Penggunaan memory anda telah mencapai 75% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
                    if (message.prefix?.isMatch)
                        message.reply(from, `*「❗」* Bot mengalami masalah memori, mohon maaf atas ketidaknyamanannya. Bot otomatis menghubungi owner untuk mengatasi masalah ini.`, id);
                    message.sendText(realOwner, "*「❗」*  Penggunaan memory anda tersisa 25%, Bot otomatis mematikan semua aktivitas, ketik *help* untuk menggunakan perintah darurat. Disarankan untuk  mengosongkan memory anda manual sebelum menggunakan bot. Ketik *run* untuk meneruskan aktivitas bot tanpa alasan apapun");
                    await ev.getCommandLeaking();
                    ev = null;
                    process.send?.({ id: "memory-leak" });
                    setTimeout(async () => {
                        if (config_1.default.create().config.memory == "low")
                            return;
                        this.log.warn(`Automatically restarting bot`);
                        await ev.refresh();
                        config_1.default.create().Set({ memory: "low" });
                        await message.sendText(realOwner, "*✅* Bot otomatis dihidupkan dan reset ke mode *low*, bot otomatis berjalan tanpa database");
                    }, 1000 * 60 * 60 * 1);
                }
                else if ((Math.round(((os_1.default.freemem() / (1024 * 1024)) * 100)) / 100) < (0, utils_1.persen)(Number(memoryFirst), 50) && memoryStatus.medium == 0) {
                    memoryStatus.medium = types_1.Memory.medium;
                    process.env.memory = "medium";
                    let ev = events_1.Events.getEvents();
                    ev.clear();
                    config_1.default.create().Set({ memory: "medium" });
                    this.log.warn(`Penggunaan memory anda telah mencapai 50% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
                    if (message.prefix?.isMatch)
                        message.reply(from, `*「❗」* Bot mengalami masalah memori, mohon maaf atas ketidaknyamanannya. Bot otomatis menghubungi owner untuk mengatasi masalah ini.`, id);
                    message.sendText(realOwner, "*「❗」*  Penggunaan memory anda tersisa 50%, Bot otomatis mematikan semua aktivitas, ketik *help* untuk menggunakan perintah darurat");
                    await ev.getCommandLeaking();
                    ev = null;
                    setTimeout(async () => {
                        if (config_1.default.create().config.memory == "low")
                            return;
                        this.log.warn(`Automatically restarting bot`);
                        await ev.refresh();
                        config_1.default.create().Set({ memory: "low" });
                        await message.sendText(realOwner, "*✅* Bot otomatis dihidupkan dan reset ke mode *low*");
                    }, 1000 * 60 * 10);
                }
                else if ((Math.round(((os_1.default.freemem() / (1024 * 1024)) * 100)) / 100) < (0, utils_1.persen)(Number(memoryFirst), 30) && memoryStatus.warn == 0) {
                    process.env.memory = "warn";
                    memoryStatus.warn = types_1.Memory.warn;
                    this.log.warn(`Penggunaan memory anda telah mencapai 30% (${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB)`);
                    message.reply(realOwner, "*「❗」* Penggunaan memory anda tersisa 70%,");
                }
            });
        };
    }
}
exports.default = Events;
