import Command, {Config, Whatsapp, Get} from ".";

@Config({eventName: "aku anak babi", costumePrefix: {isPrefix: false}})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super(true);
	}
	@Get("utils")
	override async run(client: Whatsapp.ClientType): Promise<any> {
		console.log({
			client,
			from: client.from,
			id: this.utils,
			ini: this,
		});
	}
}
