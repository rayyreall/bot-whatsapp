import Command, {Config, Whatsapp, Get } from ".";
import lodash from "lodash";
import config from "../database/config";
import type {IUserConfig } from "../types";


@Config({
	command: "access",
	isOwner: true,
	help: "access",
    description: "<command>",
    group: "owner",
    isQuerry: true,
    eventName: "accessfitur"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("ev", "utils")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        const { from, id: quoted, args, querry  } = client;
        let { command, all, remove, disable, undisable, banned, unbanned, getID, get: g } = this.utils!.ParseCommand(querry)
        let { id, get, mode } = this.utils!.ParseCommand(querry, false);
        let conn = config.create<{user: Array<Partial<IUserConfig>>}>();
        if (mode == "leaking" || mode == "emergency") {
            this.ev!.clear();
            config.create().Set({ memory: "leak"})
            await this.ev!.getCommandLeaking()
            return await client.reply(from, "*「✔」* Berhasil mengubah bot menjadi kedalam mode emegency", quoted)
        }
        if (getID) {
            let text: string = `*📝 List ID Command*\n\n`
            let ind: number = 1;
            for (const index in this.ev!.allEvents) {
                text += `*${ind++}.* *💌 ID :* ${index}\n*🟡 Command :* ${Array.isArray(this.ev!.allEvents[index].command) ? (this.ev!.allEvents[index].command as Array<string>).join(", ") : this.ev!.allEvents[index].command}\n\n`;
            }
            return client.reply(from, text, quoted);
        }
        if (g && get) {
            let num: number =  parseInt(get);
            if (isNaN(num)) return client.reply(from, `*「❗」* Harap masukkan nomer id Start 1`, quoted);
            let events: any = this.ev!.allEvents
            events = lodash.keysIn(events)
            if (!events) return client.reply(from, `*「❗」* Tidak ada event dengan nomer id ${num}`, quoted);
            return client.reply(from, `${events[num - 1]}`, quoted);
        } else if (g) {
            return client.reply(from, `*「❗」* Harap masukkan nomer id Start 1`, quoted);
        }
        let ids: string = client.ParsedMentions(args.join(" "))?.[0] || args[0];
        ids = ids.endsWith("@s.whatsapp.net") ? ids : ids + "@s.whatsapp.net";
        if (!/^[0-9]{5,18}/.test(ids)) return client.reply(from, "*「❗」* Harap masukkan nomer whatsapp yang valid", quoted)
        if (!(await client.sock.onWhatsApp(ids))[0]?.exists) return client.reply(from, "*「❗」* Nomor whatsapp tidak terdaftar", quoted)
        if (!conn.config.user.some((v) => v.id === ids)) {
            conn.set("user", [...conn.config.user, {
                id: ids,
                disable: [],
                permissions: [],
                banned: false
            }])
        }
        if (command || remove) {
            if (all) {
                let users = conn.config.user.find((v) => v.id === ids);
                for (const index in this.ev!.allEvents) {
                    if (!this.ev!.allEvents[index].isOwner) continue;
                    if (command) {
                        users!.permissions! = [...new Set([...users!.permissions!, index])];
                        conn.set("user", [...conn.config.user, users]);
                    } else if (remove) {
                        lodash.remove(users!.permissions!, (a) => a === index)
                        conn.set("user", [...new Set([...conn.config.user, users])])
                    }
                }
                if (command) return client.sendTextWithMentions(from, "*「✔」* Telah diberi access seluruh fitur", quoted)
                else if (remove) return client.sendTextWithMentions(from, "*「✔」* Telah dihapus access seluruh fitur", quoted)
            } else {
                if (!id) return client.reply(from, "*「❗」* Harap masukkan id fitur", quoted)
                let cmd: Whatsapp.CommandEvents | null = this.ev!.getCmd(id.toLowerCase()) as Whatsapp.CommandEvents;
                if (!cmd) return client.reply(from, "*「❗」* Mohon maaf kak, id fitur tidak ditemukan", quoted)
                let users = conn.config.user.find((v) => v.id === ids);
                if (command) {
                    users!.permissions! = [...new Set([...users!.permissions!, id])];
                } else if (remove) {
                    if (users!.permissions!.find(a => a === id)) return client.reply(from, "*「❗」* Mohon maaf kak, nomor ini tidak memiliki izin untuk mengakses fitur ini", quoted)
                    lodash.remove(users!.permissions!, (a) => a === id)
                }
                conn.set("user", [...conn.config.user, users])
                if (command) return await client.sendTextWithMentions(from, `@${ids.replace("@s.whatsapp.net", "")} telah diperbolehkan menggunakan fitur ${cmd.help ? Array.isArray(cmd.help) ? cmd.help[0] : cmd.help : cmd.command ? Array.isArray(cmd.command) ? cmd.command.filter(v => typeof v == 'string')[0] || "": typeof cmd.command == "string"  ? cmd.command : "" : ""}`, quoted)
                else if (remove) return await client.sendTextWithMentions(from, `@${ids.replace("@s.whatsapp.net", "")} telah dicabut akses menggunakan fitur ${cmd.help ? Array.isArray(cmd.help) ? cmd.help[0] : cmd.help : cmd.command ? Array.isArray(cmd.command) ? cmd.command.filter(v => typeof v == 'string')[0] || "": typeof cmd.command == "string"  ? cmd.command : "" : ""}`, quoted)
            }
        } else if (disable || undisable ) {
            if (!id) return client.reply(from, "*「❗」* Harap masukkan id fitur", quoted)
            let cmd: Whatsapp.CommandEvents | null = this.ev!.getCmd(id.toLowerCase()) as Whatsapp.CommandEvents;
            if (!cmd) return client.reply(from, "*「❗」* Mohon maaf kak, id fitur tidak ditemukan", quoted)
            let users = conn.config.user.find((v) => v.id === ids);
            if (disable) {
                users!.disable! = [...new Set([...users!.disable!, id])];
                conn.set("user", [...conn.config.user, users])
                return await client.sendTextWithMentions(from, `*「✔」*  Success Melakukan disable fitur khusus @${ids.replace("@s.whatsapp.net", "")}`, quoted)
            } else if (undisable) {
                if (!users?.disable?.find(a => a === id)) return client.reply(from, "*「❗」* Mohon maaf kak, nomor ini tidak terdisable untuk mengakses fitur ini", quoted)
                lodash.remove(users!.disable, (a) => a === id)
                conn.set("user", [...conn.config.user, users])
                return await client.sendTextWithMentions(from, `*「✔」*  Success Menghapus access pengunaan fitur khusus @${ids.replace("@s.whatsapp.net", "")}`, quoted)
            }
        } else if (banned || unbanned) {
            let users = conn.config.user.find((v) => v.id === ids);
            users!.banned = banned ? true : false;
            conn.set("user", [...conn.config.user, users])
            if (banned) return await client.sendTextWithMentions(from, `*「✔」*  Success Menambahkan @${ids.replace("@s.whatsapp.net", "")} ke dalam daftar banned`, quoted)
            else if (unbanned) return await client.sendTextWithMentions(from, `*「✔」*  Success Menghapus @${ids.replace("@s.whatsapp.net", "")} dari daftar banned`, quoted)
        } else {
            return await client.reply(from, "Maaf command saat ini tidak tersedia", quoted)
        }
	}
}

