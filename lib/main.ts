import Logger from "./log";
import {config} from "dotenv";
import Config from "./database/config";
import MongoDB from "./database/mongodb";
import path from "path";
import createWA from "./core/main";
import {Events} from "./events";
import type {ProcessModel, ConfigGlobal} from "./types";
config();

export const start = async () => {
	let proses: Array<ProcessModel | string> = process.argv
		.slice(2)
		.filter((p) => p.startsWith("--"))
		.map((p) => p.replace("--", ""));
	if (proses.some((p) => p === "dev")) {
		process.env.mode = "dev";
	} else {
		process.env.mode = "client";
	}
	const configure: Config<Partial<ConfigGlobal>> = Config.create();
	configure.readJSON(path.join(path.resolve("./"), "config.json"));
	configure.Set({
		mode: process.env.mode,
		loggerConfig: {
			mode: process.env.mode,
		},
	});
	const Log: Logger = new Logger(configure.config.loggerConfig!);
	const ev: Events = Events.getEvents();
	ev.setLocFolder(path.join(__dirname, "./command"));
	ev.setLog(Log);
	await ev.load();
	const db: MongoDB = MongoDB.createDB(
		configure.config.mongoURL,
		createWA,
		{
			sessions: path.join(
				path.resolve("./"),
				"./lib/database/sessions/sessions.json",
			),
			logger: Log,
		},
	);
	db.Utility(Log);
	await db.connect();
};

start();
