import Logger from "./log";
import {config} from "dotenv";
import Config from "./database/config";
import MongoDB from "./database/mongodb";
import path from "path";
import createWA from "./core/main";
import {Events} from "./events";
import chalk from "chalk";
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
	const color = (text: string, color: string) => {
		return !color ? chalk.green(text) : chalk.keyword(color)(text);
	};
	console.clear();
	console.log(color("..............", "red"));
	console.log(color("            ..,;:ccc,.", "red"));
	console.log(color("          ......''';lxO.", "red"));
	console.log(color(".....''''..........,:ld;", "red"));
	console.log(color("           .';;;:::;,,.x,", "red"));
	console.log(color("      ..'''.            0Xxoc:,.  ...", "red"));
	console.log(color("  ....                ,ONkc;,;cokOdc',.", "red"));
	console.log(color(" .                   OMo           ':ddo.", "red"));
	console.log(color("                    dMc               :OO;", "red"));
	console.log(color("                    0M.                 .:o.", "red"));
	console.log(color("                    ;Wd", "red"));
	console.log(color("                     ;XO,", "red"));
	console.log(color("                       ,d0Odlc;,..", "red"));
	console.log(color("                           ..',;:cdOOd::,.", "red"));
	console.log(color("                                    .:d;.':;.", "red"));
	console.log(color("                                       'd,  .'", "red"));
	console.log(color("                                         ;l   ..", "red"));
	console.log(color("                                          .o", "red"));
	console.log(
		color(`    [=] Bot: ${configure.config.botName} [=]            `, "cyan"),
		color("c", "red"),
	);
	console.log(
		color(
			`    [=] Number : ${configure.config.ownerNumber[0]} [=]             `,
			"cyan",
		),
		color(".'", "red"),
	);
	console.log(
		color("                                              ", "cyan"),
		color(".'", "red"),
	);
	console.log("");
	console.log("");
	const Log: Logger = new Logger(configure.config.loggerConfig!);
	const ev: Events = Events.getEvents();
	ev.setLocFolder(path.join(__dirname, "./command"));
	ev.setLog(Log);
	await ev.load();
	const db: MongoDB = MongoDB.createDB(configure.config.mongoURL, createWA, {
		sessions: path.join(
			path.resolve("./"),
			"./lib/database/sessions/sessions.json",
		),
		logger: Log,
	});
	db.Utility(Log);
	await db.connect();
};

start();
