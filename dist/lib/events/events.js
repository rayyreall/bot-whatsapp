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
exports.Events = void 0;
const utils_1 = __importDefault(require("../utils"));
const path_1 = __importDefault(require("path"));
const utils = __importStar(require("../utils"));
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
const bluebird_1 = __importDefault(require("bluebird"));
const utils_2 = require("../utils");
const chalk_1 = __importDefault(require("chalk"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const controllers_1 = __importDefault(require("../routers/controllers"));
const lodash_1 = __importDefault(require("lodash"));
const config_1 = __importDefault(require("../database/config"));
moment_timezone_1.default.tz.setDefault("Asia/Jakarta").locale("id");
const antiSpam = new Map();
class Events {
    constructor() {
        this.getCommandLeaking = async () => {
            this.file = [];
            let file = fs.readdirSync(this.location).filter((files) => /-leak\./g.test(files) && /(\.js|\.ts)$/.test(files));
            file.forEach((files) => {
                this.file.push(path_1.default.join(this.location, files));
            });
            await this.load();
            this.file = [];
        };
        this.db = new utils_1.default();
    }
    static getEvents() {
        if (!Events.instance) {
            Events.instance = new Events();
        }
        return Events.instance;
    }
    setLog(log) {
        this.log = log;
    }
    setLocFolder(path) {
        this.location = path;
    }
    getFile() {
        if (typeof this.location == "undefined")
            throw new Error("folder location not defined");
        this.file = this.file || [];
        fs.readdirSync(this.location).forEach((files) => {
            if (/(\.js|\.ts)$/.test(files) && !/^index\./g.test(files) && !/-leak\./g.test(files))
                this.file.push(path_1.default.join(this.location, files));
        });
    }
    async load() {
        if (this.file?.length == 0 || !this.file)
            this.getFile();
        if (typeof this.file == "undefined")
            throw new Error("file not defined");
        for (const index of this.file) {
            await this.forFile(index).catch((err) => this.log?.error(err));
        }
        return void 0;
    }
    clear() {
        this.db.reset();
    }
    async commandCall(client, callback) {
        return new bluebird_1.default(async (resolve, reject) => {
            callback?.(client);
            if (!client.isOwner && !config_1.default.create().config.status)
                return;
            let event = this.setToArrayEvents();
            const { isOwner, from, sender, id, command, isGroupMsg, args, isMedia, prefix } = client;
            let mess = client;
            let conn = config_1.default.create().config.user.find((user) => user.id == sender) || {};
            if (!isOwner && conn?.banned)
                return;
            let m;
            if (!isOwner && conn) {
                event = event.filter((e) => !conn?.permissions?.some((permission) => permission == e.eventName));
                event = event.filter((e) => !conn?.disable?.some((disable) => disable == e.eventName));
            }
            let participations = () => new bluebird_1.default.Promise(async () => event.filter(async (v, i) => {
                if (v.enable && v.run) {
                    bluebird_1.default.try(async () => {
                        let conf = {
                            utils: v.utils ? utils : void 0,
                            request: v.request ? axios_1.default : void 0,
                            logger: v.logger ? this.log : void 0,
                            API: v.API ? controllers_1.default : void 0,
                            ev: v.ev ? Events.getEvents() : void 0,
                            ...v?.optionsFunc,
                        };
                        m = await v.run.call(conf, mess);
                        conf = null;
                    }).catch((e) => {
                        if (e instanceof Error) {
                            this.log.error(e.message);
                            resolve(void 0);
                        }
                        m = null;
                    });
                }
            }));
            participations();
            if (!command)
                return;
            participations = () => new bluebird_1.default.Promise(async (resolve) => {
                event.forEach((value, i) => {
                    if ([value.open, !value.enable, !value.command].every((v) => !!v))
                        return;
                    let prefix = (0, utils_2.checkPrefix)(value.costumePrefix?.prefix || utils_2.DEFAULT_PREFIX, command || "");
                    let body = command;
                    if ((typeof value.command === "string" &&
                        (value.costumePrefix?.isPrefix ? prefix?.prefix : "") +
                            value.command ==
                            body) ||
                        (value.command instanceof RegExp && value.command.test(body)) ||
                        (Array.isArray(value.command) &&
                            value.command.some((v) => (typeof v == "string" &&
                                (value.costumePrefix?.isPrefix ? prefix?.prefix : "") +
                                    v ==
                                    body) ||
                                (v instanceof RegExp && v.test(body))))) {
                        let idSpam = sender;
                        if (antiSpam.has(`${idSpam}::2`))
                            return void this.log.warn(`${idSpam} is spamming`);
                        if (!client.isOwner && antiSpam.has(`${idSpam}::1`)) {
                            antiSpam.set(`${idSpam}::2`, true);
                            return client.reply(from, "*「❗」* Mohon maaf kak, anda terdeteksi Spam harap tunggu beberapa saat untuk menggunakan command kembali", id);
                        }
                        if (!isOwner)
                            antiSpam.set(`${idSpam}::1`, true);
                        if (value.isOwner && !isOwner)
                            return;
                        if (value.isGroupMsg && !isGroupMsg)
                            return;
                        if (typeof value.cmdInfo == "string" && (0, utils_2.ParseCommand)(args?.join(" ") || "")?.help)
                            return client.reply(from, value.cmdInfo, id);
                        if (value.isMedia && !isMedia)
                            return client.reply(from, "*「❗」* Mohon maaf kak, Harap masukkan media kakak untuk menggunakan fitur ini", id);
                        if (value.isQuerry && typeof args[0] === "undefined")
                            return client.reply(from, `*「❗」* Mohon maaf kak, Harap masukkan query kakak untuk menggunakan fitur ini`, id);
                        if (value.enable && value.execute) {
                            let { from, id, realOwner, command } = client;
                            bluebird_1.default.try(async () => {
                                let conf = {
                                    utils: value.utils ? utils : void 0,
                                    request: value.request ? axios_1.default : void 0,
                                    logger: value.logger ? this.log : void 0,
                                    API: value.API ? controllers_1.default : void 0,
                                    ev: value.ev ? Events.getEvents() : void 0,
                                    ...value?.optionsFunc,
                                };
                                m = await value.execute.call(conf, mess);
                                mess = null;
                                m = null;
                                conf = null;
                            })
                                .catch((err) => {
                                if (err instanceof Error) {
                                    this.log.error(err.stack);
                                    let clearing = () => new bluebird_1.default(() => {
                                        setTimeout(() => {
                                            if (antiSpam.has(`${idSpam}::2`))
                                                antiSpam.delete(`${idSpam}::2`);
                                            if (antiSpam.has(`${idSpam}::1`))
                                                antiSpam.delete(`${idSpam}::1`);
                                        }, 7000);
                                    });
                                    clearing();
                                    let key = lodash_1.default.findKey(this.allEvents, {
                                        command: value.command,
                                    });
                                    let cmd = this.getCmd(key);
                                    if (value.errorHandle.autoDisable) {
                                        cmd.errorHandle.attempts =
                                            cmd.errorHandle.attempts === 0
                                                ? 0
                                                : cmd.errorHandle.attempts - 1;
                                        if (value.errorHandle.attempts === 0)
                                            cmd.enable = false;
                                        if (value.errorHandle.warningUser) {
                                            client.reply(from, "*「❗」* Mohon maaf kak fitur kamu sedang error bot otomatis menghubungi owner", id);
                                        }
                                    }
                                    if (value.errorHandle.ownerCall) {
                                        client.sendText(realOwner, `Fitur Error : ${command}\nID Fitur : ${key}\n Status : ${cmd.enable ? "Enable" : "Disable"}\n\n${err.stack}`);
                                    }
                                    this.setCommand(key, cmd);
                                    cmd = null;
                                    m = null;
                                    resolve(void 0);
                                }
                            })
                                .finally(() => {
                                this.log.debug(chalk_1.default.keyword("red")("\x1b[1;31m~\x1b[1;37m>"), chalk_1.default.keyword("blue")(`[\x1b[1;32m${chalk_1.default.hex("#009940").bold("RECORD")}]`), chalk_1.default.red.bold("\x1b[1;31m=\x1b[1;37m>"), chalk_1.default.cyan("\x1bmSTATUS :\x1b"), chalk_1.default.hex("#fffb00")(client.fromMe ? "SELF" : "PUBLIK"), chalk_1.default.greenBright("[COMMAND]"), chalk_1.default.keyword("red")("\x1b[1;31m~\x1b[1;37m>"), chalk_1.default.blueBright(client.command), chalk_1.default.hex("#f7ef07")(`[${client.args?.length}]`), chalk_1.default.red.bold("\x1b[1;31m=\x1b[1;37m>"), chalk_1.default.hex("#26d126")("[PENGIRIM]"), chalk_1.default.hex("#f505c1")(client.pushName), chalk_1.default.hex("#ffffff")(`(${client.sender?.replace(/@s.whatsapp.net/i, "")})`), chalk_1.default.keyword("red")("\x1b[1;31m~\x1b[1;37m>"), chalk_1.default.hex("#f2ff03")("[DATE] =>"), chalk_1.default.greenBright((0, moment_timezone_1.default)(new Date()).format("LLLL").split(" GMT")[0]));
                                m = null;
                                setTimeout(() => {
                                    if (antiSpam.has(`${idSpam}::2`))
                                        antiSpam.delete(`${idSpam}::2`);
                                    if (antiSpam.has(`${idSpam}::1`))
                                        antiSpam.delete(`${idSpam}::1`);
                                }, 7000);
                                resolve(void 0);
                            });
                        }
                    }
                });
            });
            await participations();
            participations = null;
            resolve(void 0);
        });
    }
    async forFile(file) {
        try {
            let build = (await Promise.resolve().then(() => __importStar(require(file))))?.default;
            if (!this.isClass(build))
                return;
            build = new build();
            if (typeof build.config === "undefined")
                return;
            let con = {};
            if (build.utils)
                Object.defineProperty(con, "utils", {
                    value: true,
                    writable: false,
                    enumerable: true,
                    configurable: false,
                });
            if (build.request)
                Object.defineProperty(con, "request", {
                    value: true,
                    writable: false,
                    enumerable: true,
                    configurable: false,
                });
            if (build.logger)
                Object.defineProperty(con, "logger", {
                    value: true,
                    writable: false,
                    enumerable: true,
                    configurable: false,
                });
            if (build.API)
                Object.defineProperty(con, "API", {
                    value: true,
                    writable: false,
                    enumerable: true,
                    configurable: false,
                });
            if (build.ev)
                Object.defineProperty(con, "ev", {
                    value: true,
                    writable: false,
                    enumerable: true,
                    configurable: false,
                });
            let optionalFunc = lodash_1.default.keys(lodash_1.default.omit(build, [
                "config",
                "utils",
                "logger",
                "request",
                "API",
                "ev",
            ]));
            let optional;
            if (optionalFunc.length > 0) {
                optional = lodash_1.default.pick(build, optionalFunc);
            }
            if (build.config?.open) {
                build = Object.assign({ run: build.run }, build.config, con, optional ? { optionsFunc: optional } : {});
                delete build.open;
            }
            else {
                build = Object.assign({ execute: build.execute }, build.config, con, optional ? { optionsFunc: optional } : {});
                delete build.open;
            }
            const name = build.eventName.toLowerCase();
            build.eventName = name;
            this.db.set(name, build);
            build = null;
            con = null;
        }
        catch (err) {
            if (err instanceof Error)
                this.log.error(new Error(err.stack));
        }
    }
    isClass(func) {
        return (typeof func === "function" &&
            /^class\s/.test(Function.prototype.toString.call(func)));
    }
    setCommand(key, value) {
        return void this.db.set(key, value);
    }
    deleteCmd(key) {
        return void this.db.removeByKeys(key);
    }
    getCmd(key) {
        return this.db.Get(key);
    }
    get allEvents() {
        return this.db.all;
    }
    updateCmd(key, value) {
        return void this.db.update(key, value);
    }
    async refresh() {
        this.clear();
        return void (await this.load());
    }
    setToArrayEvents() {
        return this.db.toArray;
    }
}
exports.Events = Events;
