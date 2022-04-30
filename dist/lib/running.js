"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Running = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
class Running {
    constructor(wafile, dbfile) {
        this.wafile = wafile;
        this.dbfile = dbfile;
        this.run = (wafile) => {
            this.waEvents = (0, child_process_1.spawn)(process.argv0, [path_1.default.join(__dirname, wafile), ...process.argv.slice(2)], {
                stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            });
            this.waEvents.on("exit", (code) => {
                console.log(`waEvents exited with code ${code}`);
            });
            this.waEvents.on("message", (message) => {
                if (typeof message == "object") {
                    if (message.id === "write-keydb")
                        this.dbEvents.send(message);
                    else if (message.id == "memory-leak") {
                        this.dbEvents.kill();
                    }
                    else if (message.id == "memory-restart") {
                        this.dbEvents.kill();
                        this.dbEvents = this.dbrun(this.dbfile);
                        this.waEvents.kill();
                        this.waEvents = this.run(this.wafile);
                    }
                }
            });
            return this.waEvents;
        };
        this.dbrun = (dbfile) => {
            this.dbEvents = (0, child_process_1.spawn)(process.argv0, [path_1.default.join(__dirname, dbfile), ...process.argv.slice(2)], {
                stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            });
            this.dbEvents.on("exit", (code) => {
                console.log(`process exited with code ${code}`);
            });
            this.dbEvents.on("message", (message) => {
                if (typeof message == "object") {
                }
            });
            return this.dbEvents;
        };
        this.waEvents = this.run(wafile);
        this.dbEvents = this.dbrun(dbfile);
    }
}
exports.Running = Running;
new Running(fs.existsSync(path_1.default.join(__dirname, "./main.js")) ? `./main.js` : `./main.ts`, fs.existsSync(path_1.default.join(__dirname, "./database.js")) ? "./database.js" : "./database.ts");
