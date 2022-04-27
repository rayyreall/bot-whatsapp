import chalk from "chalk";
import * as fs from "fs";
import type {OptionsLogger, ColorConfig, LevelColor, myLogger} from "../types";

export default class Logger implements myLogger {
	private setColor: Partial<ColorConfig>;
	constructor(private options: OptionsLogger) {
		this.setColor = {};
		this.options.mode = this.options.mode || "dev";
		if (typeof this.options.color == "undefined") this.options.color = [];
		if (!this.hasColor("info")) {
			this.options.color.push({
				level: "info",
				color: chalk.green,
			});
		} else {
			this.options.color[
				this.options.color.findIndex((color) => color.level == "info")
			].color = chalk.green;
		}
		if (!this.hasColor("warn")) {
			this.options.color.push({
				level: "warn",
				color: chalk.yellow,
			});
		} else {
			this.options.color[
				this.options.color.findIndex((color) => color.level == "warn")
			].color = chalk.yellow;
		}
		if (!this.hasColor("error")) {
			this.options.color.push({
				level: "error",
				color: chalk.red,
			});
		} else {
			this.options.color[
				this.options.color.findIndex((color) => color.level == "error")
			].color = chalk.red;
		}
		if (typeof this.options.color !== "undefined") {
			for (const key of this.options.color) {
				this.setColor[key.level] = key.color;
			}
			this.options.color = [];
		}
	}
	public readonly info = (message: any, ...args: any[]): void => {
		if (this.options.mode === "client") return;
		console.info(this.setColor.info!(`[INFO] :`), message, ...args);
	};
	public readonly error = (message: any, ...args: any[]): void => {
		if (this.options.mode === "client") return;
		console.error(this.setColor.error!(`[ERROR] :`), message, ...args);
	};
	public readonly warn = (message: any, ...args: any[]): void => {
		if (this.options.mode === "client") return;
		console.warn(this.setColor.warn!(`[WARN] :`), message, ...args);
	};
	public readonly debug = (...args: any[]): void => {
		if (this.options.mode === "client") return;
		console.debug(...args);
	};
	protected readonly hasColor: Function = (color: LevelColor): boolean => {
		if (typeof this.options.color == "undefined") return false;
		else return this.options.color.some((item) => item.level === color);
	};
}
