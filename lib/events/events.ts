import EasyDB from "../utils";
import path from "path";
import * as utils from "../utils";
import * as fs from "fs";
import axios from "axios";
import Bluebird from "bluebird";
import type Logger from "../log";
import type Whatsapp from "../types";
import type {Prefix} from "../types";
import {checkPrefix, DEFAULT_PREFIX} from "../utils";
import chalk from "chalk";
import moment from "moment-timezone";
import Controller from "../routers/controllers";
import NodeCache from "node-cache";
import lodash from "lodash";
import performa from "performance-now";
import config from "../database/config";

moment.tz.setDefault("Asia/Jakarta").locale("id");

const antiSpam: Map<string, boolean> = new Map<string, boolean>();

export class Events {
	private location: string | undefined;
	private db: EasyDB<Whatsapp.CommandEvents>;
	private file: Array<string> | undefined;
	private log: Logger | undefined;
	private static instance: Events;
	private constructor() {
		this.db = new EasyDB();
	}
	public static getEvents(): Events {
		if (!Events.instance) {
			Events.instance = new Events();
		}
		return Events.instance;
	}
	public setLog(log: Logger) {
		this.log = log;
	}
	public setLocFolder(path: string) {
		this.location = path;
	}
	private getFile(): void {
		if (typeof this.location == "undefined")
			throw new Error("folder location not defined");
		this.file = this.file || [];
		fs.readdirSync(this.location).forEach((files) => {
			if (/(\.js|\.ts)$/.test(files) && !/^index\./g.test(files))
				this.file!.push(path.join(this.location!, files));
		});
	}
	public async load(): Promise<void> {
		this.getFile();
		if (typeof this.file == "undefined") throw new Error("file not defined");
		for (const index of this.file) {
			await this.forFile(index).catch((err) => this.log?.error(err));
		}
		return void 0;
	}
	public async commandCall(client: Whatsapp.ClientType) {
		return new Bluebird(async (resolve, reject) => {
			let event: Array<Whatsapp.CommandEvents> = this.setToArrayEvents();
			let m: any;
			let participations = (): Promise<unknown> =>
				new Bluebird.Promise(async () =>
					event.filter(
						async (v: Whatsapp.CommandEvents & Whatsapp.AddEvents, i) => {
							if (v.enable && v.run) {
								Bluebird.try(async () => {
									let conf = {
										utils: v.utils ? utils : void 0,
										request: v.request ? axios : void 0,
										logger: v.logger ? this.log : void 0,
										API: v.API ? Controller : void 0,
										ev: v.ev ? Events.getEvents() : void 0,
										...v?.optionsFunc,
									};
									m = await v.run.call(conf, client);
									conf = null as any;
								}).catch((e) => {
									if (e instanceof Error) {
										this.log!.error(e.message);
										resolve(void 0);
									}
									m = null;
								});
							}
						},
					),
				);
			participations();
			participations = () =>
				new Bluebird.Promise(async (resolve) => {
					event.forEach(
						(value: Whatsapp.CommandEvents & Whatsapp.AddEvents, i) => {
							if ([value.open, !value.enable, !value.command].every((v) => !!v))
								return;
							let prefix: Prefix | undefined = checkPrefix(
								value.costumePrefix?.prefix || DEFAULT_PREFIX,
								client.command || "",
							);
							let body: string = client.command;
							if (
								(typeof value.command === "string" &&
									(value.costumePrefix?.isPrefix ? prefix?.prefix : "") +
										value.command ==
										body) ||
								(value.command instanceof RegExp && value.command.test(body)) ||
								(Array.isArray(value.command) &&
									value.command.some(
										(v) =>
											(typeof v == "string" &&
												(value.costumePrefix?.isPrefix ? prefix?.prefix : "") +
													v ==
													body) ||
											(v instanceof RegExp && v.test(body)),
									))
							) {
								let idSpam: string = client.sender;
								if (antiSpam.has(`${idSpam}::2`))
									return void this.log!.warn(`${idSpam} is spamming`);
								if (antiSpam.has(`${idSpam}::1`)) {
									antiSpam.set(`${idSpam}::2`, true);
									return client.reply(
										client.from,
										"*「❗」* Mohon maaf kak, anda terdeteksi Spam harap tunggu beberapa saat untuk menggunakan command kembali",
										client.id,
									);
								}
								if (!client.isOwner) antiSpam.set(`${idSpam}::1`, true);
								if (value.isOwner && !client.isOwner) return;
								if (value.isGroupMsg && !client.isGroupMsg) return;
								if (value.isMedia && !client.isMedia)
									return client.reply(
										client.from,
										"*「❗」* Mohon maaf kak, Harap masukkan media kakak untuk menggunakan fitur ini",
										client.id,
									);
								if (value.enable && (value.execute as unknown)) {
									let {from, id, realOwner, command} = client;
									Bluebird.try(async () => {
										let conf = {
											utils: value.utils ? utils : void 0,
											request: value.request ? axios : void 0,
											logger: value.logger ? this.log : void 0,
											API: value.API ? Controller : void 0,
											ev: value.ev ? Events.getEvents() : void 0,
											...value?.optionsFunc,
										};
										m = await value.execute.call(conf, client);
										m = null;
										conf = null as any;
									})
										.catch((err) => {
											if (err instanceof Error) {
												this.log!.error(err.stack);
												let clearing = () =>
													new Bluebird(() => {
														setTimeout(() => {
															if (antiSpam.has(`${idSpam}::2`))
																antiSpam.delete(`${idSpam}::2`);
															if (antiSpam.has(`${idSpam}::1`))
																antiSpam.delete(`${idSpam}::1`);
														}, 7000);
													});
												clearing();
												let key: string = lodash.findKey(this.allEvents, {
													command: value.command,
												}) as keyof Whatsapp.MyEvents;
												let cmd: any = this.getCmd(key) as Whatsapp.MyEvents;
												if (value.errorHandle.autoDisable) {
													cmd.errorHandle.attempts =
														cmd.errorHandle.attempts === 0
															? 0
															: cmd.errorHandle.attempts! - 1;
													if (value.errorHandle.attempts === 0)
														cmd.enable = false;
													if (value.errorHandle.warningUser) {
														client.reply(
															from,
															"*「❗」* Mohon maaf kak fitur kamu sedang error bot otomatis menghubungi owner",
															id,
														);
													}
												}
												if (value.errorHandle.ownerCall) {
													client.sendText(
														realOwner,
														`Fitur Error : ${command}\nID Fitur : ${key}\n Status : ${
															cmd.enable ? "Enable" : "Disable"
														}\n\n${err.stack}`,
													);
												}
												this.setCommand(key, cmd);
												cmd = null;
												m = null;
												resolve(void 0);
											}
										})
										.finally(() => {
											this.log!.debug(
												chalk.keyword("red")("\x1b[1;31m~\x1b[1;37m>"),
												chalk.keyword("blue")(
													`[\x1b[1;32m${chalk.hex("#009940").bold("RECORD")}]`,
												),
												chalk.red.bold("\x1b[1;31m=\x1b[1;37m>"),
												chalk.cyan("\x1bmSTATUS :\x1b"),
												chalk.hex("#fffb00")(client.fromMe ? "SELF" : "PUBLIK"),
												chalk.greenBright("[COMMAND]"),
												chalk.keyword("red")("\x1b[1;31m~\x1b[1;37m>"),
												chalk.blueBright(client.command),
												chalk.hex("#f7ef07")(`[${client.args?.length}]`),
												chalk.red.bold("\x1b[1;31m=\x1b[1;37m>"),
												chalk.hex("#26d126")("[PENGIRIM]"),
												chalk.hex("#f505c1")(client.pushName),
												chalk.hex("#ffffff")(
													`(${client.sender?.replace(/@s.whatsapp.net/i, "")})`,
												),
												chalk.keyword("red")("\x1b[1;31m~\x1b[1;37m>"),
												chalk.hex("#f2ff03")("[DATE] =>"),
												chalk.greenBright(
													moment(new Date()).format("LLLL").split(" GMT")[0],
												),
											);
											m = null;
											setTimeout(() => {
												if (antiSpam.has(`${idSpam}::2`))
													antiSpam.delete(`${idSpam}::2`);
												if (antiSpam.has(`${idSpam}::1`))
													antiSpam.delete(`${idSpam}::1`);
											}, 7000);
											resolve(void 0);
										});
								}
							}
						},
					);
				});
			await participations();
			participations = null as any;
			resolve(void 0);
		});
	}
	private async forFile(file: string): Promise<void> {
		try {
			let build = (await import(file))?.default;
			if (!this.isClass(build)) return;
			build = new build();
			if (typeof build.config === "undefined") return;
			let con: Whatsapp.AddEvents | null = {};
			if (build.utils)
				Object.defineProperty(con, "utils", {
					value: true,
					writable: false,
					enumerable: true,
					configurable: false,
				});
			if (build.request)
				Object.defineProperty(con, "request", {
					value: true,
					writable: false,
					enumerable: true,
					configurable: false,
				});
			if (build.logger)
				Object.defineProperty(con, "logger", {
					value: true,
					writable: false,
					enumerable: true,
					configurable: false,
				});
			if (build.API)
				Object.defineProperty(con, "API", {
					value: true,
					writable: false,
					enumerable: true,
					configurable: false,
				});
			if (build.ev)
				Object.defineProperty(con, "ev", {
					value: true,
					writable: false,
					enumerable: true,
					configurable: false,
				});
			let optionalFunc: Array<string> = lodash.keys(
				lodash.omit(build, [
					"config",
					"utils",
					"logger",
					"request",
					"API",
					"ev",
				]),
			);
			let optional;
			if (optionalFunc.length > 0) {
				optional = lodash.pick(build, optionalFunc);
			}
			if (build.config?.open) {
				build = Object.assign(
					{run: build.run},
					build.config,
					con,
					optional ? {optionsFunc: optional} : {},
				);
				delete build.open;
			} else {
				build = Object.assign(
					{execute: build.execute},
					build.config,
					con,
					optional ? {optionsFunc: optional} : {},
				);
				delete build.open;
			}
			const name: string = build.eventName.toLowerCase();
			delete build.eventName;
			this.db.set(name, build);
			build = null;
			con = null;
		} catch (err) {
			if (err instanceof Error) this.log!.error(new Error(err.stack));
		}
	}
	private isClass<T>(func: T): boolean {
		return (
			typeof func === "function" &&
			/^class\s/.test(Function.prototype.toString.call(func))
		);
	}
	public setCommand(key: string, value: any): void {
		return void this.db.set(key, value);
	}
	public deleteCmd(key: string): void {
		return void this.db.removeByKeys(key);
	}
	public getCmd(key: string): unknown {
		return this.db.Get(key);
	}
	public get allEvents(): Record<string, Whatsapp.MyEvents> {
		return this.db.all;
	}
	public updateCmd(key: keyof Whatsapp.MyEvents, value: any) {
		return void this.db.update(key, value);
	}
	public async refresh(): Promise<void> {
		return void (await this.load());
	}
	public setToArrayEvents(): Array<Whatsapp.CommandEvents> {
		return this.db.toArray;
	}
}
