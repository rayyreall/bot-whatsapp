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
exports.checkMatch = exports.check = exports.Delay = exports.ErrorHandle = exports.ParseCommand = exports.DEFAULT_PREFIX = exports.runtime = exports.checkPrefix = exports.compressImage = exports.toBuffer = exports.persen = exports.GenerateID = exports.DeepKeysObject = exports.isBase64 = exports.checkURL = exports.toBufferStream = exports.searchJSON = void 0;
const stream_1 = require("stream");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const bluebird_1 = __importDefault(require("bluebird"));
const parse_ms_1 = __importDefault(require("parse-ms"));
const lodash_1 = __importDefault(require("lodash"));
const fast_levenshtein_1 = require("fast-levenshtein");
const diacritics_1 = require("diacritics");
const searchJSON = (obj, key, output) => {
    if (typeof obj === "object") {
        if (Array.isArray(key)) {
            if (!output)
                output = {};
            key.forEach((subKey) => {
                if (obj.hasOwnProperty(subKey)) {
                    output[subKey] = obj[subKey];
                }
                for (const k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        let result = (0, exports.searchJSON)(obj[k], subKey, output);
                        if (result) {
                            output[subKey] = result;
                        }
                    }
                }
            });
            return output;
        }
        else {
            if (obj.hasOwnProperty(key)) {
                return obj[key];
            }
            for (const k in obj) {
                if (obj.hasOwnProperty(k)) {
                    let result = (0, exports.searchJSON)(obj[k], key);
                    if (result) {
                        return result;
                    }
                }
            }
        }
    }
};
exports.searchJSON = searchJSON;
const toBufferStream = async function (stream) {
    return new Promise((resolve, reject) => {
        let chunks = [];
        stream.on("data", (chunk) => {
            chunks.push(chunk);
        });
        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
            chunks = null;
        });
        stream.on("error", (err) => {
            reject(err);
        });
    });
};
exports.toBufferStream = toBufferStream;
function checkURL(content, getRespon) {
    let regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
    let getUrl = content.match(regex);
    if (getUrl) {
        if (getRespon)
            return getUrl;
        else
            return true;
    }
    else {
        if (getRespon)
            return [];
        else
            return false;
    }
}
exports.checkURL = checkURL;
function isBase64(str) {
    let status = true;
    if (str === "" || str.trim() === "")
        status = false;
    try {
        status = btoa(atob(str)) == str;
    }
    catch (err) {
        status = false;
    }
    finally {
        return status;
    }
}
exports.isBase64 = isBase64;
function* DeepKeysObject(t, path = []) {
    if (typeof t === "object") {
        for (const [k, v] of Object.entries(t)) {
            yield* DeepKeysObject(v, [...path, k]);
        }
    }
    else {
        yield path.join(".");
    }
}
exports.DeepKeysObject = DeepKeysObject;
const GenerateID = () => {
    return "R4B0T" + crypto_1.default.randomBytes(15).toString("hex").toUpperCase();
};
exports.GenerateID = GenerateID;
function persen(awal, diskon) {
    return awal - (awal * (diskon / 100));
}
exports.persen = persen;
const toBuffer = async function (content) {
    if (Buffer.isBuffer(content))
        return content;
    else if (content instanceof stream_1.Readable)
        return await (0, exports.toBufferStream)(content);
    else if (typeof content == "string") {
        if (fs.existsSync(content))
            return fs.readFileSync(content);
        else if (checkURL(content))
            return await axios_1.default.get(content, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
                },
                responseType: "arraybuffer",
            });
        else if (isBase64(content))
            return Buffer.from(content, "base64");
        else if (/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/.test(content))
            return Buffer.from(content.split(";base64,")[1], "base64");
        else
            return null;
    }
    else {
        return null;
    }
};
exports.toBuffer = toBuffer;
const compressImage = async (content) => {
    return new bluebird_1.default(async (resolve) => {
        let buffer = (await (0, exports.toBuffer)(content)) || undefined;
        if (buffer) {
            buffer = await (0, sharp_1.default)(buffer).resize(32).jpeg({ quality: 50 }).toBuffer();
        }
        resolve(buffer);
        buffer = undefined;
    });
};
exports.compressImage = compressImage;
const checkPrefix = (prefix, body) => {
    let respon;
    if (Array.isArray(prefix)) {
        for (const index of prefix) {
            if (typeof index == "string" && body.startsWith(index)) {
                respon = {
                    isMatch: true,
                    prefix: index,
                    body: body.replace(index, ""),
                };
                break;
            }
            else if (index instanceof RegExp && index.test(body)) {
                respon = {
                    isMatch: true,
                    prefix: body.match(index)?.[0],
                    body: body.replace(body.match(index)?.[0], ""),
                };
                break;
            }
        }
    }
    else if (prefix instanceof RegExp && prefix.test(body)) {
        respon = {
            isMatch: true,
            prefix: String(body.match(prefix)?.[0]),
            body: body.replace(String(body.match(prefix)?.[0]), ""),
        };
    }
    else if (typeof prefix === "string" && body.startsWith(prefix)) {
        respon = {
            isMatch: true,
            prefix: prefix,
            body: body.replace(prefix, ""),
        };
    }
    return respon;
};
exports.checkPrefix = checkPrefix;
const runtime = () => {
    let time = (0, parse_ms_1.default)(process.uptime() * 1000);
    return `${time.days} Hari, ${time.hours} Jam, ${time.minutes} Menit, ${time.seconds} Detik`;
};
exports.runtime = runtime;
exports.DEFAULT_PREFIX = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi;
function ParseCommand(str, parse = true) {
    let data = {};
    str.split("--").forEach(v => {
        let arg = v.split(" ").filter((value) => value);
        if (arg.length > 1) {
            data[arg[0]] = arg.slice(1).join(" ");
        }
        else if (arg.length == 1) {
            data[arg[0]] = parse ? true : undefined;
        }
    });
    data = Object.keys(data).reduce((acc, key) => {
        if (typeof data[key] !== "undefined") {
            acc[key] = data[key];
        }
        return acc;
    }, {});
    return data;
}
exports.ParseCommand = ParseCommand;
async function ErrorHandle(func, parameters, options = {}, callback, at = 1) {
    if (!Array.isArray(func)) {
        func = [func];
        if (typeof options.limitError == "number") {
            func = lodash_1.default.times(options.limitError, () => func).flat();
            parameters = lodash_1.default.times(options.limitError, () => parameters);
        }
    }
    try {
        let data = await func[0](...parameters[0]);
        return data;
    }
    catch (err) {
        func.shift();
        parameters.shift();
        if (func.length > 0) {
            if (callback) {
                callback(at, options.description?.[0]);
                at++;
                if (typeof options.description !== "undefined" && options.description.length > 1)
                    options.description.shift();
            }
            return await ErrorHandle(func, parameters, options, callback, at);
        }
        else {
            throw err;
        }
    }
}
exports.ErrorHandle = ErrorHandle;
function Delay(ms) {
    return new bluebird_1.default((resolve) => setTimeout(resolve, ms));
}
exports.Delay = Delay;
function check(kata, validasi) {
    kata = (0, diacritics_1.remove)(kata.toLocaleLowerCase().replace(/[^\w]+/g, ''));
    validasi = (0, diacritics_1.remove)(validasi.toLocaleLowerCase().replace(/[^\w]+/g, ''));
    let hitung = 1 - ((0, fast_levenshtein_1.get)(kata, validasi) / Math.max(Math.max(kata.length, validasi.length), 1));
    let hasil = (hitung * 100).toFixed(2);
    return Number(hasil);
}
exports.check = check;
function checkMatch(str, arr) {
    let obj = {};
    for (const index of arr) {
        if (!obj[index]) {
            obj[index] = check(str, index);
        }
    }
    return Object.entries(obj).sort((a, b) => b[1] - a[1]).filter((a) => a[1] > 65.00);
}
exports.checkMatch = checkMatch;
