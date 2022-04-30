import Command, {Config, Whatsapp } from ".";
import config from "../database/config";

@Config({
	command: ["private", "self"],
    costumePrefix: {
        isPrefix: false
    },
	isOwner: true,
	help: ["private"],
    group: "owner"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        const { from, id } = client;
        let c: ReturnType<typeof config.create> = config.create();
        if (!c.config.status) return client.reply(from, "*「❗」* Mohon Maaf Status Bot Saat ini sudah Private", id);
        c.Set({ status: false })
        return client.reply(from, "*「✔」* Status Bot Berhasil diubah menjadi Private", id);
	}
}
