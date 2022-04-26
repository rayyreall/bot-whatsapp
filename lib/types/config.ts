import type {ProcessModel, OptionsLogger} from ".";

export interface IConfig {
	[k: string]: any;
	botName: string;
	ownerNumber: Array<`${number}@s.whatsapp.net`>;
	mongoURL: string;
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
