import Command, { Config, Whatsapp, Get } from ".";

@Config({command: ["sticker", "s", "stiker"], isOwner: true, isMedia: true,
 help: ["sticker"],
 group: "converter",
errorHandle: {
	attempts: 3,
	warningUser: true
} })
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("API", "utils")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
		const { args, from, id, realOwner, media }  = client;
		await client.wait(from, id);
        let file: Buffer | null = await client.decryptMedia(media!);
        let api: string | void = await new (this.API!("sticker"))(file, args.length > 0 ? this.parse(args.join(" ")) : { author: "I`am Ra", pack: "RA BOT" }).build().catch((err) => {
            if (err instanceof Error) client.reply(realOwner, String(err.stack));
            client.reply(from, "*「❗」*  Mohon Maaf kak bot gagal membuat sticker bot otomatis menghubungi Owner")
        });
		if (!api) throw new Error("Error Build To API");
		await client.sendFile(from, api, { quoted: id })
		file = null;
		api = void null;
	}
	public parse = (str: string): { author?: string, pack?: string} => {
		if (str.search(/\|/g) != -1) {
			return str.split("|").map(x => x.trim()).reduce((a, b) => {
				if (typeof a.author == "undefined") a.author = b;
				else if (typeof a.pack == "undefined") a.pack = b;
				return a;
			}, {} as { author?: string, pack?: string});
		} else {
			return { pack: str}
		}
	}
}
