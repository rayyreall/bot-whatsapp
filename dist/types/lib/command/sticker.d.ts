import Command, { Whatsapp } from ".";
export default class extends Command implements Whatsapp.MyCmd {
    constructor();
    execute(client: Whatsapp.ClientType): Promise<any>;
    parse: (str: string) => {
        author?: string;
        pack?: string;
    };
}
