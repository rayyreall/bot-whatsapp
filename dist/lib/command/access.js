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
const config_1 = __importDefault(require("../database/config"));
let default_1 = class default_1 extends _1.default {
    constructor() {
        super();
    }
    async execute(client) {
        const { from, id: quoted, args, querry } = client;
        let { command, all, remove, disable, undisable, banned, unbanned, getID, get: g } = this.utils.ParseCommand(querry);
        let { id, get, mode } = this.utils.ParseCommand(querry, false);
        let conn = config_1.default.create();
        if (mode == "leaking" || mode == "emergency") {
            this.ev.clear();
            config_1.default.create().Set({ memory: "leak" });
            await this.ev.getCommandLeaking();
            return await client.reply(from, "*「✔」* Berhasil mengubah bot menjadi kedalam mode emegency", quoted);
        }
        if (getID) {
            let text = `*📝 List ID Command*\n\n`;
            let ind = 1;
            for (const index in this.ev.allEvents) {
                text += `*${ind++}.* *💌 ID :* ${index}\n*🟡 Command :* ${Array.isArray(this.ev.allEvents[index].command) ? this.ev.allEvents[index].command.join(", ") : this.ev.allEvents[index].command}\n\n`;
            }
            return client.reply(from, text, quoted);
        }
        if (g && get) {
            let num = parseInt(get);
            if (isNaN(num))
                return client.reply(from, `*「❗」* Harap masukkan nomer id Start 1`, quoted);
            let events = this.ev.allEvents;
            events = lodash_1.default.keysIn(events);
            if (!events)
                return client.reply(from, `*「❗」* Tidak ada event dengan nomer id ${num}`, quoted);
            return client.reply(from, `${events[num - 1]}`, quoted);
        }
        else if (g) {
            return client.reply(from, `*「❗」* Harap masukkan nomer id Start 1`, quoted);
        }
        let ids = client.ParsedMentions(args.join(" "))?.[0] || args[0];
        ids = ids.endsWith("@s.whatsapp.net") ? ids : ids + "@s.whatsapp.net";
        if (!/^[0-9]{5,18}/.test(ids))
            return client.reply(from, "*「❗」* Harap masukkan nomer whatsapp yang valid", quoted);
        if (!(await client.sock.onWhatsApp(ids))[0]?.exists)
            return client.reply(from, "*「❗」* Nomor whatsapp tidak terdaftar", quoted);
        if (!conn.config.user.some((v) => v.id === ids)) {
            conn.set("user", [...conn.config.user, {
                    id: ids,
                    disable: [],
                    permissions: [],
                    banned: false
                }]);
        }
        if (command || remove) {
            if (all) {
                let users = conn.config.user.find((v) => v.id === ids);
                for (const index in this.ev.allEvents) {
                    if (!this.ev.allEvents[index].isOwner)
                        continue;
                    if (command) {
                        users.permissions = [...new Set([...users.permissions, index])];
                        conn.set("user", [...conn.config.user, users]);
                    }
                    else if (remove) {
                        lodash_1.default.remove(users.permissions, (a) => a === index);
                        conn.set("user", [...new Set([...conn.config.user, users])]);
                    }
                }
                if (command)
                    return client.sendTextWithMentions(from, "*「✔」* Telah diberi access seluruh fitur", quoted);
                else if (remove)
                    return client.sendTextWithMentions(from, "*「✔」* Telah dihapus access seluruh fitur", quoted);
            }
            else {
                if (!id)
                    return client.reply(from, "*「❗」* Harap masukkan id fitur", quoted);
                let cmd = this.ev.getCmd(id.toLowerCase());
                if (!cmd)
                    return client.reply(from, "*「❗」* Mohon maaf kak, id fitur tidak ditemukan", quoted);
                let users = conn.config.user.find((v) => v.id === ids);
                if (command) {
                    users.permissions = [...new Set([...users.permissions, id])];
                }
                else if (remove) {
                    if (users.permissions.find(a => a === id))
                        return client.reply(from, "*「❗」* Mohon maaf kak, nomor ini tidak memiliki izin untuk mengakses fitur ini", quoted);
                    lodash_1.default.remove(users.permissions, (a) => a === id);
                }
                conn.set("user", [...conn.config.user, users]);
                if (command)
                    return await client.sendTextWithMentions(from, `@${ids.replace("@s.whatsapp.net", "")} telah diperbolehkan menggunakan fitur ${cmd.help ? Array.isArray(cmd.help) ? cmd.help[0] : cmd.help : cmd.command ? Array.isArray(cmd.command) ? cmd.command.filter(v => typeof v == 'string')[0] || "" : typeof cmd.command == "string" ? cmd.command : "" : ""}`, quoted);
                else if (remove)
                    return await client.sendTextWithMentions(from, `@${ids.replace("@s.whatsapp.net", "")} telah dicabut akses menggunakan fitur ${cmd.help ? Array.isArray(cmd.help) ? cmd.help[0] : cmd.help : cmd.command ? Array.isArray(cmd.command) ? cmd.command.filter(v => typeof v == 'string')[0] || "" : typeof cmd.command == "string" ? cmd.command : "" : ""}`, quoted);
            }
        }
        else if (disable || undisable) {
            if (!id)
                return client.reply(from, "*「❗」* Harap masukkan id fitur", quoted);
            let cmd = this.ev.getCmd(id.toLowerCase());
            if (!cmd)
                return client.reply(from, "*「❗」* Mohon maaf kak, id fitur tidak ditemukan", quoted);
            let users = conn.config.user.find((v) => v.id === ids);
            if (disable) {
                users.disable = [...new Set([...users.disable, id])];
                conn.set("user", [...conn.config.user, users]);
                return await client.sendTextWithMentions(from, `*「✔」*  Success Melakukan disable fitur khusus @${ids.replace("@s.whatsapp.net", "")}`, quoted);
            }
            else if (undisable) {
                if (!users?.disable?.find(a => a === id))
                    return client.reply(from, "*「❗」* Mohon maaf kak, nomor ini tidak terdisable untuk mengakses fitur ini", quoted);
                lodash_1.default.remove(users.disable, (a) => a === id);
                conn.set("user", [...conn.config.user, users]);
                return await client.sendTextWithMentions(from, `*「✔」*  Success Menghapus access pengunaan fitur khusus @${ids.replace("@s.whatsapp.net", "")}`, quoted);
            }
        }
        else if (banned || unbanned) {
            let users = conn.config.user.find((v) => v.id === ids);
            users.banned = banned ? true : false;
            conn.set("user", [...conn.config.user, users]);
            if (banned)
                return await client.sendTextWithMentions(from, `*「✔」*  Success Menambahkan @${ids.replace("@s.whatsapp.net", "")} ke dalam daftar banned`, quoted);
            else if (unbanned)
                return await client.sendTextWithMentions(from, `*「✔」*  Success Menghapus @${ids.replace("@s.whatsapp.net", "")} dari daftar banned`, quoted);
        }
        else {
            return await client.reply(from, "Maaf command saat ini tidak tersedia", quoted);
        }
    }
};
__decorate([
    (0, _1.Get)("ev", "utils"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    (0, _1.Config)({
        command: "access",
        isOwner: true,
        help: "access",
        description: "<command>",
        group: "owner",
        isQuerry: true,
        eventName: "accessfitur"
    }),
    __metadata("design:paramtypes", [])
], default_1);
exports.default = default_1;
