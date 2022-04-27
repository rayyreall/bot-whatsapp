import {Readable} from "stream";
import axios from "axios";
import * as fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import Bluebird from "bluebird";
import parsems, { Parsed } from "parse-ms";
import type {Prefix} from "../types";

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
		else if (/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/.test(content)) return Buffer.from(content.split(";base64,")[1], "base64");
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
	let time: Parsed = parsems(process.uptime() * 1000)
	return `${time.days} Hari, ${time.hours} Jam, ${time.minutes} Menit, ${time.seconds} Detik`
}

export const DEFAULT_PREFIX: string | RegExp | Array<string | RegExp> =
	/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi;
