import Command, { Whatsapp } from ".";
export default class extends Command implements Whatsapp.MyCmd {
    constructor();
    test: () => never;
    execute(client: Whatsapp.ClientType): Promise<any>;
}
