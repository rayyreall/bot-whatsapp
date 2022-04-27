import Command, {Config, Whatsapp, Get} from ".";

@Config({
	enable: false,
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super(false);
	}
	@Get("logger", "utils")
	override async run(client: Whatsapp.ClientType): Promise<any> {
		this.logger!.info({
			from: client.from,
			id: this.utils!.GenerateID(),
			api: this.request,
		});
	}
}
