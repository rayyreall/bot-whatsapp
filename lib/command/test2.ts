import Command, {Config, Whatsapp} from ".";

@Config({command: "bang"})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
	override async execute(client: Whatsapp.ClientType): Promise<any> {
		console.log("oit");
	}
}
