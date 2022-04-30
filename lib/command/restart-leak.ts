import Command, {Config, Whatsapp, Get } from ".";
import config from "../database/config"

@Config({
	command: ["restart"],
    costumePrefix: {
        isPrefix: false
    },
	isOwner: true,
    help: "restart"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("ev")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        const { from, id } = client;
        await client.reply(from, "Bot akan merestart process anda", id)
        process.send?.({ id: "memory-restart"})
	}
}

