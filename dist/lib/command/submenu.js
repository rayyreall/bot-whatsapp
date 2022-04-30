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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importStar(require("."));
const config_1 = __importDefault(require("../database/config"));
const lodash_1 = __importDefault(require("lodash"));
let default_1 = class default_1 extends _1.default {
    constructor() {
        super(true);
    }
    async run(client) {
        const { buttonsID, from, quotedMsg, realOwner, id, prefix, sender, isOwner } = client;
        if (quotedMsg?.stanzaId?.startsWith("R4B0T")) {
            switch (buttonsID?.toLowerCase()) {
                case "owner":
                    return void await client.sendContact(from, { phone: realOwner.replace("@s.whatsapp.net", ""), name: config_1.default.create().config.ownerName || "I`am Ra" }, {
                        stanzaId: id.key.id,
                        participant: id.key.participant,
                        quotedMessage: id.message,
                        remoteJid: id.key.remoteJid
                    });
                case "error":
                    let ev = this.ev.setToArrayEvents().filter(e => !e.enable && typeof e.execute == "function" && e.help);
                    if (ev.length > 0) {
                        return void await client.reply(from, `*📝 List Error Command* :\n\n${ev.map((v, i) => `*${(i + 1)}.* ${v.command}`).join("\n")}\n\n📑 Total Error : ${ev.length}`, id);
                    }
                    else {
                        return void await client.reply(from, "📝 Tidak ada command yang Error", id);
                    }
                case "submenu":
                    let events = this.ev.setToArrayEvents().filter(e => e.enable && typeof e.execute == "function" && e.command);
                    let conn = config_1.default.create().config.user.find(e => e.id == sender);
                    events = events.filter(e => typeof e.command == "string" || Array.isArray(e.command));
                    events = events.map((v) => {
                        if (Array.isArray(v.command))
                            v.command = v.command.filter(e => typeof e == "string" && ((typeof v.help == "string" && v.help !== e) || (Array.isArray(v.help) && !v.help.includes(e))));
                        return v;
                    });
                    if (conn && isOwner)
                        events = events.filter((e) => !conn?.disable?.some(v => v == e.eventName));
                    let cmd = lodash_1.default.mapValues(lodash_1.default.groupBy(events, "group"), (c) => lodash_1.default
                        .map(c, (v2) => {
                        if (typeof v2.command === "string")
                            return v2.costumePrefix?.isPrefix
                                ? {
                                    prefix: `${v2.costumePrefix?.prefix
                                        ? v2.costumePrefix.prefix
                                        : `${prefix?.prefix || "."}`}${v2.command}${v2.description ? ` ${v2.description}` : ""}`,
                                }
                                : { noprefix: `${v2.command}${v2.description ? ` ${v2.description}` : ""}` };
                        return v2.command.map((value) => v2.costumePrefix?.isPrefix
                            ? {
                                prefix: `${v2.costumePrefix?.prefix
                                    ? v2.costumePrefix.prefix
                                    : `${prefix?.prefix || "."}`}${value}${v2.description ? ` ${v2.description}` : ""}`,
                            }
                            : { noprefix: `${value}${v2.description ? ` ${v2.description}` : ""}` });
                    })
                        .flat());
                    cmd = lodash_1.default.mapValues(cmd, (c) => c.reduce((acc, v) => {
                        if (typeof acc.noprefix === "undefined")
                            acc.noprefix = [];
                        if (typeof acc.prefix === "undefined")
                            acc.prefix = [];
                        if (typeof v.noprefix !== "undefined")
                            acc.noprefix.push(v.noprefix);
                        if (typeof v.prefix !== "undefined")
                            acc.prefix.push(v.prefix);
                        return acc;
                    }, {}));
                    cmd = lodash_1.default.mapValues(cmd, (c) => {
                        c.noprefix = c.noprefix.sort();
                        c.prefix = c.prefix.sort();
                        return c;
                    });
                    let tags = Object.keys(cmd).sort();
                    let cmd2 = {};
                    tags.forEach((tag) => {
                        cmd2[tag] = cmd[tag];
                        cmd2[tag].prefix = [...new Set(cmd2[tag].prefix)];
                        cmd2[tag].noprefix = [...new Set(cmd2[tag].noprefix)];
                    });
                    cmd = cmd2;
                    cmd2 = {};
                    let text = `*📝 List Sub menu* :\n\n`;
                    let inp = 1;
                    for (const tag in cmd) {
                        text += `\n*menu ${tag.toLowerCase()} :*\n`;
                        for (const np of cmd[tag].noprefix) {
                            text += `*${inp++}.* ${np}\n`;
                        }
                        for (const p of cmd[tag].prefix) {
                            text += `*${inp++}.* ${p}\n`;
                        }
                    }
                    return void await client.reply(from, text, id);
            }
        }
    }
};
__decorate([
    (0, _1.Get)("ev", "utils"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "run", null);
default_1 = __decorate([
    (0, _1.Config)({}),
    __metadata("design:paramtypes", [])
], default_1);
exports.default = default_1;
