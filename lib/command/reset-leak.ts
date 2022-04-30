import Command, {Config, Whatsapp, Get } from ".";
import config from "../database/config"

@Config({
	command: ["reset"],
    costumePrefix: {
        isPrefix: false
    },
	isOwner: true,
    help: "reset"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("ev")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        const { from, id } = client;
        await this.ev!.refresh()
        config.create().Set({ memory: "low" })
        return await client.reply(from, "*「✔」* Bot Berhasil di reset", id)
	}
}

