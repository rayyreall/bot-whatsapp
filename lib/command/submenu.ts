import Command, {Config, Whatsapp, Get} from ".";
import config from "../database/config";
import lodash from "lodash";
import type { IUserConfig } from "../types";

@Config({})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super(true);
	}
    @Get("ev", "utils")
	override async run(client: Whatsapp.ClientType): Promise<any> {
        const {  buttonsID, from, quotedMsg, realOwner, id, prefix, sender, isOwner } = client;
        if (quotedMsg?.stanzaId?.startsWith("R4B0T")) {
            switch(buttonsID?.toLowerCase()) {
                case "owner":
                    return void await client.sendContact(from, { phone: realOwner.replace("@s.whatsapp.net", ""), name: config.create().config.ownerName || "I`am Ra"}, {
                        stanzaId: id.key.id,
                        participant: id.key.participant,
                        quotedMessage: id.message,
                        remoteJid: id.key.remoteJid
                    })
                case "error":
                    let ev: Array<Whatsapp.CommandEvents> = this.ev!.setToArrayEvents().filter(e => !e.enable && typeof e.execute == "function" && e.help)
                    if (ev.length > 0) {
                        return void await client.reply(from, `*📝 List Error Command* :\n\n${ev.map((v, i) => `*${(i+1)}.* ${v.command}`).join("\n")}\n\n📑 Total Error : ${ev.length}`, id)
                    } else {
                        return void await client.reply(from, "📝 Tidak ada command yang Error", id)
                    }
                case "submenu":
                    let events: Array<Whatsapp.CommandEvents> = this.ev!.setToArrayEvents().filter(e => e.enable && typeof e.execute == "function" && e.command)
                    let conn: Partial<IUserConfig> | undefined = config.create<{ user:Array<IUserConfig>}>().config.user.find(e => e.id == sender)
                    events = events.filter(e => typeof e.command == "string" || Array.isArray(e.command))
                    events = events.map((v) =>{
                        if (Array.isArray(v.command)) v.command = v.command.filter(e => typeof e == "string" && ((typeof v.help == "string" && v.help !== e) ||  (Array.isArray(v.help) && !v.help.includes(e))))
                        return v;
                    })
                    if (conn && isOwner) events = events.filter((e) => !conn?.disable?.some(v => v == e.eventName));
                    let cmd: any = lodash.mapValues(lodash.groupBy(events, "group"), (c) =>
                    lodash
                        .map(c, (v2) => {
                            if (typeof v2.command === "string")
                                return v2.costumePrefix?.isPrefix
                                    ? {
                                            prefix: `${
                                                v2.costumePrefix?.prefix
                                                    ? v2.costumePrefix.prefix
                                                    : `${prefix?.prefix || "."}`
                                            }${v2.command}${v2.description ? ` ${v2.description}`: ""}`,
                                      }
                                    : {noprefix: `${v2.command}${v2.description ? ` ${v2.description}`: ""}`};
                            return (v2.command as Array<string>).map((value: string) =>
                                v2.costumePrefix?.isPrefix
                                    ? {
                                            prefix: `${
                                                v2.costumePrefix?.prefix
                                                    ? v2.costumePrefix.prefix
                                                    : `${prefix?.prefix || "."}`
                                            }${value}${v2.description ? ` ${v2.description}`: ""}`,
                                      }
                                    : {noprefix: `${value}${v2.description ? ` ${v2.description}`: ""}`},
                            );
                        })
                        .flat(),
                );
                cmd = lodash.mapValues(cmd, (c) =>
                    c.reduce((acc: any, v: any) => {
                        if (typeof acc.noprefix === "undefined") acc.noprefix = [];
                        if (typeof acc.prefix === "undefined") acc.prefix = [];
                        if (typeof v.noprefix !== "undefined") acc.noprefix.push(v.noprefix);
                        if (typeof v.prefix !== "undefined") acc.prefix.push(v.prefix);
                        return acc;
                    }, {}),
                );
                cmd = lodash.mapValues(cmd, (c) => {
                    c.noprefix = c.noprefix.sort();
                    c.prefix = c.prefix.sort();
                    return c;
                });
                let tags: Array<string> = Object.keys(cmd).sort();
                let cmd2: Record<string, any> = {};
                tags.forEach((tag) => {
                    cmd2[tag] = cmd[tag];
                    cmd2[tag].prefix = [...new Set(cmd2[tag].prefix)];
                    cmd2[tag].noprefix = [...new Set(cmd2[tag].noprefix)];
                });
                cmd = cmd2;
                cmd2 = {};
                let text: string = `*📝 List Sub menu* :\n\n`;
                let inp: number = 1;
                for (const tag in cmd) {
                    text += `\n*menu ${tag.toLowerCase()} :*\n`;
                    for (const np of cmd[tag].noprefix) {
                        text += `*${inp++}.* ${np}\n`;
                    }
                    for (const p of cmd[tag].prefix) {
                        text += `*${inp++}.* ${p}\n`;
                    }
                }
                return void await client.reply(from, text, id)
            }
        }
	}
}
