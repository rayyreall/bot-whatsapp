import Command, {Config, Whatsapp, Get } from ".";
import util from "util";

@Config({
	command: /^(?:=>|>)$/i,
    costumePrefix: {
        isPrefix: false
    },
	isOwner: true,
	errorHandle: {
		autoDisable: false,
        warningUser: false
	},
	help: "=>",
    description: "<code jawascript>",
    group: "owner"
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("ev", "utils", "API", "request")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        let data: Whatsapp.ClientType = client
        const convert: string = `(async () => {
            await data.reply(data.from, require("util").format((await (async () => {
                ${data.args.join(" ")}
            })())), data.id)
        })()`
        return void eval(util.format(convert))
	}
}

