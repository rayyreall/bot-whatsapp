"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const log_1 = __importDefault(require("./log"));
const dotenv_1 = require("dotenv");
const config_1 = __importDefault(require("./database/config"));
const mongodb_1 = __importDefault(require("./database/mongodb"));
const path_1 = __importDefault(require("path"));
const main_1 = __importDefault(require("./core/main"));
const events_1 = require("./events");
const chalk_1 = __importDefault(require("chalk"));
(0, dotenv_1.config)();
const start = async () => {
    let proses = process.argv
        .slice(2)
        .filter((p) => p.startsWith("--"))
        .map((p) => p.replace("--", ""));
    if (proses.some((p) => p === "dev")) {
        process.env.mode = "dev";
    }
    else {
        process.env.mode = "client";
    }
    const configure = config_1.default.create();
    configure.readJSON(path_1.default.join(path_1.default.resolve("./"), "config.json"));
    configure.Set({
        mode: process.env.mode,
        loggerConfig: {
            mode: process.env.mode,
        },
        status: false,
        user: [],
        memory: "low"
    });
    const color = (text, color) => {
        return !color ? chalk_1.default.green(text) : chalk_1.default.keyword(color)(text);
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
    console.log(color(`    [=] Bot: ${configure.config.botName} [=]            `, "cyan"), color("c", "red"));
    console.log(color(`    [=] Number : ${configure.config.ownerNumber[0]} [=]             `, "cyan"), color(".'", "red"));
    console.log(color("                                              ", "cyan"), color(".'", "red"));
    console.log("");
    console.log("");
    const Log = new log_1.default(configure.config.loggerConfig);
    const ev = events_1.Events.getEvents();
    ev.setLocFolder(path_1.default.join(__dirname, "./command"));
    ev.setLog(Log);
    await ev.load();
    const db = mongodb_1.default.createDB(configure.config.mongoURL, main_1.default, {
        sessions: path_1.default.join(path_1.default.resolve("./"), "./lib/database/sessions/sessions.json"),
        logger: Log,
    });
    db.Utility(Log);
    await db.connect(proses.some((p) => p == "resetdb") ? path_1.default.join(path_1.default.resolve("./"), "./lib/database/sessions/sessions.json") : undefined);
};
exports.start = start;
(0, exports.start)();
