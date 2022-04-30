import {DeleteResult, MongoClient, OptionalId, Document, Collection} from "mongodb";
import type {MongoConnect, MongoOptions} from "../../types";
import Log from "../../log";
import type {WASocket} from "@adiwajshing/baileys";

export default class MongoDB implements MongoConnect {
	private db: MongoClient;
	private static instance: MongoDB;
	public database
	private constructor(
		private url: string,
		private runScript?: (sessions: string, logger: Log) => Promise<WASocket>,
		private config?: MongoOptions,
	) {
		this.db = new MongoClient(this.url);
		this.database = this.db.db("mydb")
	}
	private log: Log | undefined;
	public static createDB(
		url?: string,
		runScript?: (sessions: string, logger: Log) => Promise<WASocket>,
		config?: MongoOptions,
	): MongoDB {
		if (!MongoDB.instance) {
			if (!url) throw new Error("No url provided");
			MongoDB.instance = new MongoDB(url, runScript, config);
		}
		return MongoDB.instance;
	}
	public Utility = <T extends Log>(log: T): void => {
		this.log = log;
	};
	public collection = (key: string) => {
		return this.database.collection(key)
	}
	public removeAll = async (key: string): Promise<DeleteResult> => {
		return await this.collection(key).deleteMany({})
	}
	public has = async (key: string): Promise<boolean> => {
		const result = await this.collection(key).findOne({});
		return !!result;
	}
	public update = async <T> (key: string, keyDb: any,obj: T) => {
		return await this.collection(key).updateOne(keyDb, {$set: obj})
	}
	public get = async <T extends object> (key: string, keyDb: T) => {
		return await this.collection(key).findOne(keyDb )
	}
	public insert = async (key: string, obj: OptionalId<Document>) => {
		return await this.collection(key).insertOne({...obj})
	}
	public delete = async (key: string, keyDb: any) => {
		return await this.collection(key).deleteOne(keyDb)
	}
	public connect = async (reset?: string): Promise<void> => {
		this.db.once("open", async () => {
			this.log!.info("Connected to MongoDB");
			if (typeof this.runScript == "function") {
				this.log!.info("Run Whatsapp bot");
				if (reset) await this.removeAll(reset)
				await this.runScript(this.config!.sessions, this.log!).catch((e) =>
					this.log!.error(e),
				);
			}
		});
		this.db.once("close", () => {
			this.log!.info("Disconnected from MongoDB");
		});
		this.db.once("error", (err) => {
			this.log!.error(err);
		});
		try {
			await this.db.connect();
		} catch (err) {
			if (err instanceof Error) {
				this.log!.error(err);
				process.exit(1);
			}
		}
	};
}
