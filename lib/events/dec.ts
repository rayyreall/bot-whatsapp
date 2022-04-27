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
				if (config.open == undefined && typeof this.isOpen == "boolean")
					config.open = this.isOpen;
				if (config.enable == undefined) config.enable = true;
				if (typeof config.errorHandle == "undefined") config.errorHandle = {};
				if (typeof config.errorHandle.autoDisable == "undefined")
					config.errorHandle.autoDisable = true;
				if (typeof config.errorHandle.attempts == "undefined")
					config.errorHandle.attempts = 1;
				if (typeof config.errorHandle.ownerCall == "undefined")
					config.errorHandle.ownerCall = true;
				if (typeof config.errorHandle.warningUser == "undefined")
					config.errorHandle.warningUser = true;
				if (!config.eventName)
					config.eventName = crypto.randomBytes(30).toString("hex");
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
export function Get(require: keyof Whatsapp.TypeRequired, ...args: any[]) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const original: Array<keyof Whatsapp.TypeRequired> = [require, ...args];
		target.utils = original.some((x) => x == "utils");
		target.logger = original.some((x) => x == "logger");
		target.request = original.some((x) => x == "request");
		target.API = original.some((x) => x.toUpperCase() == "API");
		target.ev = original.some((x) => x == "ev");
	};
}
