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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Config {
    constructor() {
        this.readJSON = (path) => {
            if (!fs.existsSync(path))
                throw new Error(`${path} does not exist`);
            this.db = JSON.parse(fs.readFileSync(path, "utf8"));
        };
        this.db = {};
    }
    static create() {
        if (!Config.config) {
            Config.config = new Config();
        }
        return Config.config;
    }
    get config() {
        return this.db;
    }
    set(key, value) {
        this.db[key] = value;
    }
    Set(key) {
        for (const k in key) {
            this.db[k] = key[k];
        }
        return void this.db;
    }
}
exports.default = Config;
__exportStar(require("./config"), exports);
