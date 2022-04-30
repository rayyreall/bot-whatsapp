"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
function GeneratePath() {
    let str = path_1.default.join(path_1.default.resolve("./"), "./lib/database/keys", `${crypto_1.default.randomBytes(16).toString("hex")}-keydb.json`);
    if ((0, fs_1.existsSync)(str))
        return GeneratePath();
    return str;
}
let dbSessions;
const run = async () => {
    process.on("message", async (data) => {
        if (typeof data == "object") {
            if (data.id == "write-keydb") {
                if (!dbSessions)
                    dbSessions = GeneratePath();
                if (!(0, fs_1.existsSync)(dbSessions)) {
                    (0, fs_1.writeFileSync)(dbSessions, JSON.stringify([], null, 2));
                }
                let db = JSON.parse((0, fs_1.readFileSync)(dbSessions, "utf8"));
                if (db.length >= 1000) {
                    dbSessions = GeneratePath();
                    db = [];
                }
                db.push(data.data);
                (0, fs_1.writeFileSync)(dbSessions, JSON.stringify(db, null, 2));
                db = null;
            }
        }
    });
};
run();
