"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.Config = void 0;
const crypto_1 = __importDefault(require("crypto"));
const lodash_1 = __importDefault(require("lodash"));
function Config(config) {
    return (constructor) => {
        return class extends constructor {
            constructor(...args) {
                super(...args);
                if (config.open == undefined && typeof this.isOpen == "boolean")
                    config.open = this.isOpen;
                if (config.enable == undefined)
                    config.enable = true;
                if (typeof config.errorHandle == "undefined")
                    config.errorHandle = {};
                if (typeof config.errorHandle.autoDisable == "undefined")
                    config.errorHandle.autoDisable = true;
                if (typeof config.errorHandle.attempts == "undefined")
                    config.errorHandle.attempts = 1;
                if (typeof config.errorHandle.ownerCall == "undefined")
                    config.errorHandle.ownerCall = true;
                if (typeof config.errorHandle.warningUser == "undefined")
                    config.errorHandle.warningUser = true;
                if (!config.eventName)
                    config.eventName = crypto_1.default.randomBytes(30).toString("hex");
                if (typeof config.group == "undefined")
                    config.group = "random";
                if (!config.costumePrefix)
                    config.costumePrefix = {
                        isPrefix: true,
                    };
                this.config = config;
                delete this.isOpen;
                lodash_1.default.keys(this).forEach((key) => {
                    if (typeof this[key] == "undefined") {
                        delete this[key];
                    }
                });
            }
        };
    };
}
exports.Config = Config;
function Get(require, ...args) {
    return function (target, propertyKey, descriptor) {
        const original = [require, ...args];
        target.utils = original.some((x) => x == "utils");
        target.logger = original.some((x) => x == "logger");
        target.request = original.some((x) => x == "request");
        target.API = original.some((x) => x.toUpperCase() == "API");
        target.ev = original.some((x) => x == "ev");
    };
}
exports.Get = Get;
