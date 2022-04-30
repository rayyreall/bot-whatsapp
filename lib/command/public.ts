import Command, {Config, Whatsapp } from ".";
import config from "../database/config";

@Config({
	command: ["public", "publik"],
    costumePrefix: {
        isPrefix: false
    },
	isOwner: true,
	help: ["public"],
    group: "owner"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        const { from, id } = client;
        let c: ReturnType<typeof config.create> = config.create();
        if (c.config.status) return client.reply(from, "*「❗」* Mohon Maaf Status Bot Saat ini sudah Publik", id);
        c.Set({ status: true })
        return client.reply(from, "*「✔」* Status Bot Berhasil diubah menjadi Publik", id);
	}
}

