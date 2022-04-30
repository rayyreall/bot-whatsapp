import type { OptionsLogger} from ".";

export interface IConfig {
	[k: string]: any;
	botName: string;
	ownerNumber: Array<`${number}@s.whatsapp.net`>;
	mongoURL: string;
	ownerName?: string;
}

export interface Configurations<T extends object> {
	readJSON: (path: string) => void;
	get config(): T & IConfig;
	Set(config: Required<T>): void;
}

export interface ConfigGlobal {
	mode: ProcessModel;
	loggerConfig: OptionsLogger;
}


export interface IUserConfig {
    id: string;
    disable: string[];
    permissions: string[];
    banned: boolean;
}

export type ProcessModel = "dev" | "client";
