import { Writer } from "@commonify/steno";
import { readFileSync, existsSync, writeFileSync } from "fs";
import crypto from "crypto";
import path from "path";
import lodash from "lodash";

function GeneratePath (): string {
    let str: string = path.join(path.resolve("./"),"./lib/database/keys", `${crypto.randomBytes(16).toString("hex")}-keydb.json`);
    if (existsSync(str)) return GeneratePath();
    return str
}
let dbSessions: string | undefined | null;
const run = async () => {
    process.on("message", async (data: any) => {
        if (typeof data == "object") {
            if (data.id == "write-keydb") {
                if (!dbSessions) dbSessions = GeneratePath();
                if (!existsSync(dbSessions)) {
                    writeFileSync(dbSessions, JSON.stringify([], null, 2))
                }
                let db = JSON.parse(readFileSync(dbSessions, "utf8"));
                if (db.length >= 1000) {
                    dbSessions = GeneratePath();
                    db = [];
                }
                db.push(data.data)
                writeFileSync(dbSessions, JSON.stringify(db, null, 2))
                db = null
            }
        }
    })   
}
run();