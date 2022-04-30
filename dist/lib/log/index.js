"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    constructor(options) {
        this.options = options;
        this.info = (message, ...args) => {
            if (this.options.mode === "client")
                return;
            console.info(this.setColor.info(`[INFO] :`), message, ...args);
        };
        this.error = (message, ...args) => {
            if (this.options.mode === "client")
                return;
            console.error(this.setColor.error(`[ERROR] :`), message, ...args);
        };
        this.warn = (message, ...args) => {
            if (this.options.mode === "client")
                return;
            console.warn(this.setColor.warn(`[WARN] :`), message, ...args);
        };
        this.debug = (...args) => {
            if (this.options.mode === "client")
                return;
            console.debug(...args);
        };
        this.hasColor = (color) => {
            if (typeof this.options.color == "undefined")
                return false;
            else
                return this.options.color.some((item) => item.level === color);
        };
        this.setColor = {};
        this.options.mode = this.options.mode || "dev";
        if (typeof this.options.color == "undefined")
            this.options.color = [];
        if (!this.hasColor("info")) {
            this.options.color.push({
                level: "info",
                color: chalk_1.default.green,
            });
        }
        else {
            this.options.color[this.options.color.findIndex((color) => color.level == "info")].color = chalk_1.default.green;
        }
        if (!this.hasColor("warn")) {
            this.options.color.push({
                level: "warn",
                color: chalk_1.default.yellow,
            });
        }
        else {
            this.options.color[this.options.color.findIndex((color) => color.level == "warn")].color = chalk_1.default.yellow;
        }
        if (!this.hasColor("error")) {
            this.options.color.push({
                level: "error",
                color: chalk_1.default.red,
            });
        }
        else {
            this.options.color[this.options.color.findIndex((color) => color.level == "error")].color = chalk_1.default.red;
        }
        if (typeof this.options.color !== "undefined") {
            for (const key of this.options.color) {
                this.setColor[key.level] = key.color;
            }
            this.options.color = [];
        }
    }
}
exports.default = Logger;
