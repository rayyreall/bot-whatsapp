import Command, { Whatsapp } from ".";
export default class extends Command implements Whatsapp.MyCmd {
    constructor();
    run(client: Whatsapp.ClientType): Promise<any>;
}
