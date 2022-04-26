import type Whatsapp from "../types";
import crypto from "crypto";
import * as utils from "../utils";
import lodash from "lodash";
import Log from "../log";
import axios from "axios";

export function Config(config: Partial<Whatsapp.MyEvents>) {
	return <T extends {new (...args: any[]): {}}>(constructor: T) => {
		return class extends constructor {
			[x: string]: any;
			constructor(...args: any[]) {
				super(...args);
				if (
					config.open == undefined &&
					typeof this.isOpen == "boolean"
				)
					config.open = this.isOpen;
				if (config.enable == undefined)
					config.enable = true;
				if (!config.eventName)
					config.eventName = crypto
						.randomBytes(30)
						.toString("hex");
				if (!config.costumePrefix)
					config.costumePrefix = {
						isPrefix: true,
					};
				this.config = config;
				delete this.isOpen;
				lodash.keys(this).forEach((key) => {
					if (typeof this[key] == "undefined") {
						delete this[key];
					}
				});
			}
		};
	};
}
export function Get(require: keyof Whatsapp.TypeRequired) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		if (require === "utils") Object.freeze(target.utils);
		if (require === "logger") {
			target.logger = Log;
		}
		if (require === "request") {
			target.request = axios;
		}
	};
}
