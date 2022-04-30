import {Readable} from "stream";
import axios from "axios";
import * as fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import Bluebird from "bluebird";
import parsems, {Parsed} from "parse-ms";
import lodash from "lodash";
import { get } from "fast-levenshtein";
import { remove } from "diacritics";
import type {Prefix, OptionsAttemps } from "../types";

export const searchJSON = <T>(
	obj: any,
	key: string | Array<string>,
	output?: any,
): T | undefined => {
	if (typeof obj === "object") {
		if (Array.isArray(key)) {
			if (!output) output = {};
			key.forEach((subKey) => {
				if (obj.hasOwnProperty(subKey)) {
					output[subKey] = obj[subKey] as T;
				}
				for (const k in obj) {
					if (obj.hasOwnProperty(k)) {
						let result = searchJSON(
							obj[k] as {
								[key: string]: unknown;
							},
							subKey,
							output,
						);
						if (result) {
							output[subKey] = result;
						}
					}
				}
			});
			return output;
		} else {
			if (obj.hasOwnProperty(key)) {
				return obj[key] as T;
			}
			for (const k in obj) {
				if (obj.hasOwnProperty(k)) {
					let result = searchJSON(obj[k] as {[key: string]: unknown}, key);
					if (result) {
						return result as T;
					}
				}
			}
		}
	}
};
export const toBufferStream = async function (
	stream: Readable,
): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		let chunks: Array<Buffer> = [];
		stream.on("data", (chunk: Buffer) => {
			chunks.push(chunk);
		});
		stream.on("end", () => {
			resolve(Buffer.concat(chunks));
			chunks = null as unknown as Array<Buffer>;
		});
		stream.on("error", (err: Error) => {
			reject(err);
		});
	});
};

export function checkURL(content: string, getRespon: true): Array<string>;
export function checkURL(content: string, getRespon?: false): boolean;
export function checkURL(
	content: string,
	getRespon?: boolean,
): boolean | Array<string> {
	let regex: RegExp =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
	let getUrl: RegExpMatchArray | null = content.match(regex);
	if (getUrl) {
		if (getRespon) return getUrl;
		else return true;
	} else {
		if (getRespon) return [];
		else return false;
	}
}
export function isBase64(str: string): boolean {
	let status: boolean = true;
	if (str === "" || str.trim() === "") status = false;
	try {
		status = btoa(atob(str)) == str;
	} catch (err) {
		status = false;
	} finally {
		return status;
	}
}

export function* DeepKeysObject<T extends object>(
	t: T,
	path: any = [],
): IterableIterator<string> {
	if (typeof t === "object") {
		for (const [k, v] of Object.entries(t)) {
			yield* DeepKeysObject(v, [...path, k]);
		}
	} else {
		yield path.join(".");
	}
}

export const GenerateID = (): string => {
	return "R4B0T" + crypto.randomBytes(15).toString("hex").toUpperCase();
};
export function persen(awal: number, diskon: number){
	return awal - (awal * (diskon / 100));
}

export const toBuffer = async function (
	content: string | Buffer | Readable,
): Promise<Buffer | null> {
	if (Buffer.isBuffer(content)) return content;
	else if (content instanceof Readable) return await toBufferStream(content);
	else if (typeof content == "string") {
		if (fs.existsSync(content)) return fs.readFileSync(content);
		else if (checkURL(content))
			return await axios.get(content, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
				},
				responseType: "arraybuffer",
			});
		else if (isBase64(content)) return Buffer.from(content, "base64");
		else if (/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/.test(content))
			return Buffer.from(content.split(";base64,")[1], "base64");
		else return null;
	} else {
		return null;
	}
};

export const compressImage = async (
	content: string | Buffer | Readable,
): Promise<Buffer | undefined> => {
	return new Bluebird<Buffer | undefined>(async (resolve) => {
		let buffer: Buffer | undefined = (await toBuffer(content)) || undefined;
		if (buffer) {
			buffer = await sharp(buffer).resize(32).jpeg({quality: 50}).toBuffer();
		}
		resolve(buffer);
		buffer = undefined;
	});
};

export const checkPrefix = (
	prefix: string | Array<string | RegExp> | RegExp,
	body: string,
): Prefix | undefined => {
	let respon: Prefix | undefined;
	if (Array.isArray(prefix)) {
		for (const index of prefix) {
			if (typeof index == "string" && body.startsWith(index)) {
				respon = {
					isMatch: true,
					prefix: index,
					body: body.replace(index, ""),
				};
				break;
			} else if (index instanceof RegExp && index.test(body)) {
				respon = {
					isMatch: true,
					prefix: body.match(index)?.[0] as string,
					body: body.replace(body.match(index)?.[0] as string, ""),
				};
				break;
			}
		}
	} else if (prefix instanceof RegExp && prefix.test(body)) {
		respon = {
			isMatch: true,
			prefix: String(body.match(prefix)?.[0]),
			body: body.replace(String(body.match(prefix)?.[0]), ""),
		};
	} else if (typeof prefix === "string" && body.startsWith(prefix)) {
		respon = {
			isMatch: true,
			prefix: prefix,
			body: body.replace(prefix, ""),
		};
	}
	return respon;
};

export const runtime = (): string => {
	let time: Parsed = parsems(process.uptime() * 1000);
	return `${time.days} Hari, ${time.hours} Jam, ${time.minutes} Menit, ${time.seconds} Detik`;
};

export const DEFAULT_PREFIX: string | RegExp | Array<string | RegExp> =
	/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi;


export function ParseCommand <T = Record<string, string| undefined>>(str: string, parse: boolean = true): T {
		let data: Record<string, string| undefined> = {};
		str.split("--").forEach(v => {
			let arg: string[] = v.split(" ").filter((value) => value)
			if (arg.length > 1) {
				data[arg[0]] = arg.slice(1).join(" ");
			} else if (arg.length == 1){
				(data as any)[arg[0] as any] = parse ? true : undefined;
			}
		})
		data = Object.keys(data).reduce((acc: Record<string, string| undefined>, key) => {
			if (typeof data[key] !== "undefined") {
				acc[key] = data[key];
			}
			return acc
		}, {})
		return data as unknown as T;
	}
	export async function ErrorHandle<V = any>(func: Array<any>| any, parameters: any, options: Partial<OptionsAttemps> = {}, callback?: (attemps: number, deskriptor?: string) => void, at: number = 1): Promise<V> {
		if (!Array.isArray(func)) {
			func = [func];
			if (typeof options.limitError == "number") {
				func = lodash.times(options.limitError, () => func).flat()
				parameters = lodash.times(options.limitError, () => parameters)
			}
		}
		try {
			let data = await func[0](...parameters[0]);
			return data;
		} catch (err) {
			func.shift();
			parameters.shift();
			if (func.length > 0) {
				if (callback) {
					callback(at, options.description?.[0])
					at++;
					if (typeof options.description !== "undefined" && options.description.length > 1) options.description.shift();
				}
				return await ErrorHandle(func, parameters, options, callback,at);
			} else {
				throw err;
			}
		}
	}

	export function Delay (ms: number): Promise<void> {
		return new Bluebird((resolve) => setTimeout(resolve, ms))
	}

export function check (kata: string, validasi: string): number  {
		kata = remove(kata.toLocaleLowerCase().replace(/[^\w]+/g, ''));
		validasi =  remove(validasi.toLocaleLowerCase().replace(/[^\w]+/g, ''));
		let hitung: number = 1 - (get(kata, validasi) / Math.max(Math.max(kata.length, validasi.length), 1))
		let hasil: string = (hitung * 100).toFixed(2)
		return Number(hasil)
}
export function checkMatch (str: string, arr: string[]): Array<Array<string|unknown>> {
	let obj: { [k: string]: number } = {}
	for (const index of arr) {
		if (!obj[index]) {
			obj[index] = check(str, index)
		}
	}
	return Object.entries(obj).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).filter((a: [string,number]) => a[1] > 65.00);
}