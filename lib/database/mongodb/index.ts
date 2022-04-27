import {MongoClient} from "mongodb";
import type {MongoConnect, MongoOptions} from "../../types";
import Log from "../../log";
import type {WASocket} from "@adiwajshing/baileys";

export default class MongoDB implements MongoConnect {
	private db: MongoClient;
	private static instance: MongoDB;
	private constructor(
		private url: string,
		private runScript?: (sessions: string, logger: Log) => Promise<WASocket>,
		private config?: MongoOptions,
	) {
		this.db = new MongoClient(this.url);
	}
	private log: Log | undefined;
	public static createDB(
		url: string,
		runScript?: (sessions: string, logger: Log) => Promise<WASocket>,
		config?: MongoOptions,
	): MongoDB {
		if (!MongoDB.instance) {
			MongoDB.instance = new MongoDB(url, runScript, config);
		}
		return MongoDB.instance;
	}
	public Utility = <T extends Log>(log: T): void => {
		this.log = log;
	};
	public connect = async (): Promise<void> => {
		this.db.once("open", async () => {
			this.log!.info("Connected to MongoDB");
			if (typeof this.runScript == "function") {
				this.log!.info("Run Whatsapp bot");
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
