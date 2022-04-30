import Command, {Config, Whatsapp, Get} from ".";
import lodash from "lodash";
import moment from "moment-timezone";
import performa from "performance-now";
import config from "../database/config";
import type { IUserConfig } from "../types";

@Config({command: "menu", help: "menu", group: "user", eventName: "menu"})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
	@Get("ev", "utils")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
		const {prefix, isOwner, from, id, realOwner, sender} = client;
		let events: Array<Whatsapp.CommandEvents> = this.ev!.setToArrayEvents();
		let conn: Partial<IUserConfig> | undefined = config.create<{ user:Array<IUserConfig>}>().config.user.find(e => e.id == sender)
		events = events.filter((e) => e.help && e.enable && e.group);
		if (conn && isOwner) events = events.filter((e) => !conn?.disable?.some((d) => d === e.eventName));
		let cmd: any = lodash.mapValues(lodash.groupBy(events, "group"), (c) =>
			lodash
				.map(c, (v2) => {
					if (typeof v2.help === "string")
						return v2.costumePrefix?.isPrefix
							? {
									prefix: `${
										v2.costumePrefix?.prefix
											? v2.costumePrefix.prefix
											: `${prefix?.prefix || "."}`
									}${v2.help}${v2.description ? ` ${v2.description}`: ""}`,
							  }
							: {noprefix: `${v2.help}${v2.description ? ` ${v2.description}`: ""}`};
					return v2.help.map((value: string) =>
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
		const ping: number = performa();
		let text: string = `👋🏻 Halo ${
			isOwner ? "My Owner 🤴🏻" : "ka"
		} Selamat menggunakan Bot ya


*🤴🏻 Bot :* ${config.create().config.botName}
*⏰ Jam* : ${moment(new Date()).format("LLLL").split(" GMT")[0]}
*⏳ Runtime* : ${this.utils!.runtime()}
*🍃 Speed* : ${(performa() - ping).toFixed(2)} ms
*🪀 Creator* : I\`am Ra
*🌄 Lib* : Baileys
*📜 Language :* Typescript
*⚔️ Prefix :* ${prefix?.prefix ? prefix.prefix : "No Prefix"}
*🕵🏻‍♂️ Github :* rayyreall
*💌 Status :* ${config.create().config.status ? "Public" : "Private"}
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

		return await client.sendButtons(from, { footerText: "🔖 @Powered by Ra",buttons: [{
				buttonId: "error",
				buttonText:  "𝐄𝐑𝐑𝐎𝐑 𝐂𝐌𝐃",
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
			throw e
		})
	}
}
