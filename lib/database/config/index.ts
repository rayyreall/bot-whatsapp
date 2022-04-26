import * as fs from "fs";
import type {IConfig, Configurations} from "../../types";

export default class Config<T extends object = any>
	implements Configurations<T>
{
	private static config: Config;
	private db: Partial<IConfig>;
	private constructor() {
		this.db = {};
	}
	public static create<K extends object = any>(): Config<K> {
		if (!Config.config) {
			Config.config = new Config();
		}
		return Config.config as Config<K>;
	}
	public readJSON = (path: string): void => {
		if (!fs.existsSync(path))
			throw new Error(`${path} does not exist`);
		this.db = JSON.parse(fs.readFileSync(path, "utf8"));
	};
	public get config(): IConfig & T {
		return this.db as IConfig & T;
	}
	public Set(key: any) {
		for (const k in key) {
			this.db[k] = key[k];
		}
		return void this.db;
	}
}

export * from "./config";
