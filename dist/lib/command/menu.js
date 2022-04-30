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
const lodash_1 = __importDefault(require("lodash"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const performance_now_1 = __importDefault(require("performance-now"));
const config_1 = __importDefault(require("../database/config"));
let default_1 = class default_1 extends _1.default {
    constructor() {
        super();
    }
    async execute(client) {
        const { prefix, isOwner, from, id, realOwner, sender } = client;
        let events = this.ev.setToArrayEvents();
        let conn = config_1.default.create().config.user.find(e => e.id == sender);
        events = events.filter((e) => e.help && e.enable && e.group);
        if (conn && isOwner)
            events = events.filter((e) => !conn?.disable?.some((d) => d === e.eventName));
        let cmd = lodash_1.default.mapValues(lodash_1.default.groupBy(events, "group"), (c) => lodash_1.default
            .map(c, (v2) => {
            if (typeof v2.help === "string")
                return v2.costumePrefix?.isPrefix
                    ? {
                        prefix: `${v2.costumePrefix?.prefix
                            ? v2.costumePrefix.prefix
                            : `${prefix?.prefix || "."}`}${v2.help}${v2.description ? ` ${v2.description}` : ""}`,
                    }
                    : { noprefix: `${v2.help}${v2.description ? ` ${v2.description}` : ""}` };
            return v2.help.map((value) => v2.costumePrefix?.isPrefix
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
        const ping = (0, performance_now_1.default)();
        let text = `👋🏻 Halo ${isOwner ? "My Owner 🤴🏻" : "ka"} Selamat menggunakan Bot ya


*🤴🏻 Bot :* ${config_1.default.create().config.botName}
*⏰ Jam* : ${(0, moment_timezone_1.default)(new Date()).format("LLLL").split(" GMT")[0]}
*⏳ Runtime* : ${this.utils.runtime()}
*🍃 Speed* : ${((0, performance_now_1.default)() - ping).toFixed(2)} ms
*🪀 Creator* : I\`am Ra
*🌄 Lib* : Baileys
*📜 Language :* Typescript
*⚔️ Prefix :* ${prefix?.prefix ? prefix.prefix : "No Prefix"}
*🕵🏻‍♂️ Github :* rayyreall
*💌 Status :* ${config_1.default.create().config.status ? "Public" : "Private"}
*🌚 Instagram :* @rayyreall
*🔑 Apikey* : Ga Pake
${process.env.server !== undefined ? "*🗄 Server :* " + process.env.server : ""} 
*👾 SC :* https://github.com/rayyreall/bot-whatsapp\n\n`;
        for (const tag in cmd) {
            text += `\n\n            *MENU ${tag.toUpperCase()}*\n\n`;
            for (const np of cmd[tag].noprefix) {
                text += `*ℒ⃝🕊️ •* *${np.trim()}*\n`;
            }
            for (const p of cmd[tag].prefix) {
                text += `*ℒ⃝🕊️ •* *${p.trim()}*\n`;
            }
        }
        text += `\n\n__________________________________
*Notes :*
*- Jangan Pernah Menelpon Bot Dan Owner Jika Menelpon Akan di block Otomatis dan TIdak ada Kata Unblock ‼️*
*- Jika Menemukan Bug, Error, Saran Fitur Harap Segera Lapor Ke Owner*
*- Bot Ini masih dalam Tahap pengembangan baru bikin:v*
*- Bot Ini Dilengkapi Anti Spam, anda bisa menggunakan command berikutnya setelah prosess sebelumnya berakhir*
	
*Group : Coming soon*
__________________________________
*🔖 || IG*
@rayyreall`;
        return await client.sendButtons(from, { footerText: "🔖 @Powered by Ra", buttons: [{
                    buttonId: "error",
                    buttonText: "𝐄𝐑𝐑𝐎𝐑 𝐂𝐌𝐃",
                    type: 1,
                }, {
                    buttonId: "owner",
                    buttonText: "𝗢𝗪𝗡𝗘𝗥 / 𝗖𝗥𝗘𝗔𝗧𝗢𝗥",
                    type: 1
                }, {
                    buttonId: "submenu",
                    buttonText: "𝐒𝐔𝐁 𝐌𝐄𝐍𝐔",
                    type: 1
                }],
            contentText: text,
            headerType: 4,
            media: "./lib/database/media/thumb.png"
        }, {
            contextInfo: {
                mentionedJid: [...realOwner, sender]
            }
        }).catch(e => {
            throw e;
        });
    }
};
__decorate([
    (0, _1.Get)("ev", "utils"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    (0, _1.Config)({ command: "menu", help: "menu", group: "user", eventName: "menu" }),
    __metadata("design:paramtypes", [])
], default_1);
exports.default = default_1;
