import Command, {Config, Whatsapp} from ".";
import path from "path";

@Config({command: "test", isOwner: true,
 errorHandle: {
	attempts: 3,
} })
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
	public test = () => {
		console.log("testt");
	}
	override async execute(client: Whatsapp.ClientType): Promise<any> {
		this.test()
	}
}
