import EasyDB from "../utils";
import path from "path";
import Command from ".";
import * as fs from "fs";
import Bluebird from "bluebird";
import type Logger from "../log";
import type Whatsapp from "../types";
import type {Prefix} from "../types";
import {checkPrefix, DEFAULT_PREFIX} from "../utils";
import chalk from "chalk";
import moment from "moment-timezone";

moment.tz.setDefault("Asia/Jakarta").locale("id");

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
		if (typeof this.file == "undefined")
			throw new Error("file not defined");
		for (const index of this.file) {
			await this.forFile(index).catch((err) =>
				this.log?.error(err),
			);
		}
		return void 0;
	}
	public async commandCall(client: Whatsapp.ClientType) {
		return new Bluebird(async (resolve, reject) => {
			let event: Array<Whatsapp.CommandEvents> =
				this.setToArrayEvents();
			let participations = (): Promise<unknown> =>
				new Bluebird.Promise(async () =>
					event.filter(async (v, i) => {
						if (v.enable && v.run) {
							Bluebird.try(async () => {
								await v.run(client);
							}).catch((e) => {
								if (
									e instanceof
									Error
								) {
									this.log!.error(
										e.message,
									);
								}
							});
						}
					}),
				);
			participations();
			participations = () =>
				new Bluebird.Promise(async (resolve) => {
					event.forEach((value, i) => {
						if (
							[
								value.open,
								!value.enable,
								!value.command,
							].every((v) => !!v)
						)
							return;
						let prefix: Prefix | undefined =
							checkPrefix(
								value.costumePrefix
									?.prefix ||
									DEFAULT_PREFIX,
								client.command,
							);
						let body: string = client.command;
						if (
							(typeof value.command ===
								"string" &&
								(value.costumePrefix
									?.isPrefix
									? prefix?.prefix
									: "") +
									value.command ==
									body) ||
							(value.command instanceof
								RegExp &&
								value.command.test(
									body,
								)) ||
							(Array.isArray(
								value.command,
							) &&
								value.command.some(
									(v) =>
										(typeof v ==
											"string" &&
											(value
												.costumePrefix
												?.isPrefix
												? prefix?.prefix
												: "") +
												v ==
												body) ||
										(v instanceof
											RegExp &&
											v.test(
												body,
											)),
								))
						) {
							if (
								value.isOwner &&
								!client.isOwner
							)
								return;
							if (
								value.isGroupMsg &&
								!client.isGroupMsg
							)
								return;
							if (
								value.enable &&
								(value.execute as unknown)
							) {
								Bluebird.try(
									async () => {
										await value.execute(
											client,
										);
									},
								)
									.catch((err) => {
										if (
											err instanceof
											Error
										) {
											this.log!.error(
												err.message,
											);
										}
									})
									.finally(() => {
										this.log!.debug(
											chalk.keyword(
												"red",
											)(
												"\x1b[1;31m~\x1b[1;37m>",
											),
											chalk.keyword(
												"blue",
											)(
												`[\x1b[1;32m${chalk
													.hex(
														"#009940",
													)
													.bold(
														"RECORD",
													)}]`,
											),
											chalk.red.bold(
												"\x1b[1;31m=\x1b[1;37m>",
											),
											chalk.cyan(
												"\x1bmSTATUS :\x1b",
											),
											chalk.hex(
												"#fffb00",
											)(
												client.fromMe
													? "SELF"
													: "PUBLIK",
											),
											chalk.greenBright(
												"[COMMAND]",
											),
											chalk.keyword(
												"red",
											)(
												"\x1b[1;31m~\x1b[1;37m>",
											),
											chalk.blueBright(
												client.command,
											),
											chalk.hex(
												"#f7ef07",
											)(
												`[${client.args?.length}]`,
											),
											chalk.red.bold(
												"\x1b[1;31m=\x1b[1;37m>",
											),
											chalk.hex(
												"#26d126",
											)(
												"[PENGIRIM]",
											),
											chalk.hex(
												"#f505c1",
											)(
												client.pushName,
											),
											chalk.hex(
												"#ffffff",
											)(
												`(${client.sender?.replace(
													/@s.whatsapp.net/i,
													"",
												)})`,
											),
											chalk.keyword(
												"red",
											)(
												"\x1b[1;31m~\x1b[1;37m>",
											),
											chalk.hex(
												"#f2ff03",
											)(
												"[DATE] =>",
											),
											chalk.greenBright(
												moment(
													new Date(),
												)
													.format(
														"LLLL",
													)
													.split(
														" GMT",
													)[0],
											),
										);
										resolve(
											void 0,
										);
									});
							}
						}
					});
				});
			await participations();
		});
	}
	private async forFile(file: string): Promise<void> {
		try {
			let build = (await import(file))?.default;
			if (!this.isClass(build)) return;
			build = new build();
			if (typeof build.config === "undefined") return;
			if (build.config?.open) {
				build = Object.assign(
					{run: build.run},
					build.config,
				);
				delete build.open;
			} else {
				build = Object.assign(
					{execute: build.execute},
					build.config,
				);
				delete build.open;
			}
			const name: string = build.eventName;
			delete build.eventName;
			this.db.set(name, build);
			build = null;
		} catch (err) {
			if (err instanceof Error)
				this.log!.error(new Error(err.stack));
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
