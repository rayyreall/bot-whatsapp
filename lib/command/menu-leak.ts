import Command, {Config, Whatsapp, Get } from ".";

@Config({
	command: ["menu", "help"],
    costumePrefix: {
        isPrefix: false
    },
	isOwner: true,
    help: "menu"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("ev")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        const { from, id } = client;
        let events: Whatsapp.CommandEvents[] = this.ev!.setToArrayEvents();
        events = events.filter((e) => e.help && e.enable)
        let text: string = `*🚨 Emergency Menu*\n\n`;
        let ind: number = 1;
        events.forEach((e) => {
            if (typeof e.help === 'string') text += `*${ind++}.* ${e.help}\n`;
            else {
                for (const index of e.help) {
                    text += `*${ind++}.* ${index}\n`;
                }
            }
        })
        events = []
        return void await client.reply(from, text, id)
	}
}

