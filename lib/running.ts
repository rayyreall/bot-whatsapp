import { spawn } from "child_process";
import type { ChildProcess } from "child_process";
import path from "path";
import type { ProcessModel } from "./types";
import * as fs from "fs";

export class Running  {
    private waEvents: ChildProcess;
    private dbEvents: ChildProcess | undefined;
    constructor (private wafile: string, private dbfile: string) {
        this.waEvents =  this.run(wafile);
        this.dbEvents = this.dbrun(dbfile);
    }
    private run = (wafile: string) => {
        this.waEvents = spawn(process.argv0, [path.join(__dirname, wafile), ...process.argv.slice(2)], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        });
        this.waEvents.on("exit", (code) => {
            console.log(`waEvents exited with code ${code}`);
        })
        this.waEvents.on("message", (message: any) => {
            if (typeof message == "object") {
                if (message.id === "write-keydb") this.dbEvents!.send(message)
                else if (message.id == "memory-leak") {
                    this.dbEvents!.kill();
                } else if (message.id == "memory-restart") {
                    this.dbEvents!.kill();
                    this.dbEvents = this.dbrun(this.dbfile);
                    this.waEvents!.kill();
                    this.waEvents = this.run(this.wafile);
                }
            }
        })
        return this.waEvents;
    }
    private dbrun = (dbfile: string) => {
        this.dbEvents = spawn(process.argv0, [path.join(__dirname, dbfile), ...process.argv.slice(2)], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        });
        this.dbEvents.on("exit", (code) => {
            console.log(`process exited with code ${code}`);
        })
        this.dbEvents.on("message", (message: any) => {
            if (typeof message == "object") {
            }
        })
        return this.dbEvents;
    }
} 

new Running(fs.existsSync(path.join(__dirname, "./main.js")) ? `./main.js` : `./main.ts`, fs.existsSync(path.join(__dirname, "./database.js")) ? "./database.js" : "./database.ts");