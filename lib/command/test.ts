import Command, {Config, Whatsapp, Get } from ".";
@Config({
	command: "test",
	isOwner: true,
})
export default class extends Command implements Whatsapp.MyCmd {
	constructor() {
		super();
	}
    @Get("utils")
	override async execute(client: Whatsapp.ClientType): Promise<any> {
        let data = client;
        const { from, id, querry } = client;
        /*
        const a = async () => {
            throw new Error("error")
        }
        const b =async () => {
           await this.utils!.Delay(7000)
            throw "aku"
        }
        const c = async () => {
            await this.utils!.Delay(10000)
            throw "aku"
        }
        const d = async () => {
            await this.utils!.Delay(9000)
            throw "aku"
        }
        const e = async (su: string) => {
            return su
        }
        let u = await this.utils!.ErrorHandle([a,b,c,d,e], [[], [], [], [], [querry]], {
            description: [
                "Terjadi kesalahan pada engine a, tunggu beberapa saat bot sedang menguji engine b",
                "Terjadi kesalahan pada engine b, tunggu beberapa saat bot sedang menguji engine c",
                "Terjadi kesalahan pada engine c, tunggu beberapa saat bot sedang menguji engine d",
                "Terjadi kesalahan pada engine d, tunggu beberapa saat bot sedang menguji engine e",
                "Terjadi kesalahan pada engine e, tunggu beberapa saat bot sedang menguji engine f",
            ]
        }, async (att, desk) => {
            await client.reply(from, `Terdeteksi Kegagalan ${att}, ${desk}`, id)
        }).catch(err => {
            throw err
        })
        return await client.reply(from, "bot sudah mendapatkan respon dari engine e : " + u, id)
        */
        let d= {...client.GetSerialize(), ...client.GetSerialize(),...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(),...client.GetSerialize()}
       setInterval(() => {
           d = {...d, ...client.GetSerialize(), ...client.GetSerialize(),...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(),...client.GetSerialize()}
       }, 1000)
	}
}

