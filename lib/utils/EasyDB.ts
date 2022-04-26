import lodash from "lodash";
import {searchJSON} from ".";
import type {Database, ConfigSetObject, Conditions} from "../types";

export default class EasyDB<T> implements Database<T> {
	private db: Record<string, T>;
	constructor(private yourDB?: Record<string, T>) {
		if (this.yourDB) {
			this.db = this.yourDB;
		} else {
			this.db = {};
		}
	}
	public DangerAccess(value: any) {
		this.db = value;
	}
	public set(key: string, value: any): void {
		this.db[key] = value;
	}
	public readDB(): Record<string, T> {
		return this.db;
	}
	public add(key: string, value: T): void {
		if (this.db.hasOwnProperty(key)) {
			throw new Error("your keys duplicated in database");
		}
		this.db[key] = value;
	}
	public static create<T>() {
		return new EasyDB<T>();
	}
	public Get(key: string): T | null | undefined {
		if (this.db.hasOwnProperty(key)) {
			return this.db[key];
		} else {
			return null;
		}
	}
	public searchDB<SearchType>(
		key: string | Array<string>,
	): SearchType | undefined {
		return searchJSON(this.db, key);
	}
	public has(key: string): boolean {
		return this.db.hasOwnProperty(key);
	}
	public hasObject(key: string): boolean {
		return EasyDB.hasObject(this.db, key);
	}
	public static hasObject<T extends object>(obj: T, key: string): boolean {
		return lodash.has(obj, key);
	}
	public static getObject<T extends object, Value>(
		obj: T,
		key: string,
	): Value | undefined {
		if (this.hasObject(obj, key)) {
			return lodash.get(obj, key);
		}
	}
	public getObject<Value>(key: string): Value | undefined {
		return EasyDB.getObject(this.db, key);
	}
	public setObject(config: string, value: any): Record<string, T>;
	public setObject(config: ConfigSetObject): Record<string, T>;
	public setObject(
		config: ConfigSetObject | string,
		value?: any,
	): Record<string, T> {
		if (typeof config == "string") {
			return EasyDB.setObject(this.db, config, value) as Record<
				string,
				T
			>;
		}
		return EasyDB.setObject(this.db, config) as Record<string, T>;
	}
	public static setObject<T extends object>(
		obj: T,
		config: string,
		value: any,
		autoset?: boolean,
	): T;
	public static setObject<T extends object>(
		obj: T,
		config: ConfigSetObject,
		autoset?: boolean,
	): T;
	public static setObject<T extends object>(
		obj: T,
		config: ConfigSetObject | string,
		value?: any,
		autoSet: boolean = true,
	): T {
		let newConfig: T = JSON.parse(JSON.stringify(obj));
		if (!autoSet) Object.freeze(obj);
		if (typeof config == "string") {
			if (autoSet) {
				lodash.set(obj, config, value);
			} else {
				lodash.set(newConfig, config, value);
			}
		} else {
			for (const index in config) {
				if (autoSet) lodash.set(obj, index, config[index]);
				else lodash.set(newConfig, index, config[index]);
			}
		}
		if (autoSet) return obj;
		else return newConfig;
	}
	public removeObject(key: string): boolean {
		return EasyDB.removeObject(this.db, key, true);
	}
	public static removeObject<T extends object>(
		obj: T,
		key: string,
		autoSet: true,
	): boolean;
	public static removeObject<T extends object>(
		obj: T,
		key: string,
		autoSet: false,
	): T;
	public static removeObject<T extends object>(
		obj: T,
		key: string,
		autoSet: boolean = true,
	): T | boolean {
		let newConfig: T = JSON.parse(JSON.stringify(obj));
		if (autoSet) {
			lodash.unset(obj, key);
			return obj;
		} else {
			lodash.unset(newConfig, key);
			return newConfig;
		}
	}
	public FindAndRemove(key: string): Record<string, T> {
		return EasyDB.FindAndRemove(this.db, key, true) as Record<
			string,
			T
		>;
	}
	public static FindAndRemove<T extends object>(
		obj: T,
		key: string,
		autoSet: boolean = true,
	): T | undefined {
		let spesipik: string[] = this.FindSpecificLocation(obj, key);
		if (spesipik.length == 0) {
			return undefined;
		}
		if (autoSet) {
			this.removeObject(obj, spesipik[0], autoSet);
			return obj;
		} else {
			return this.removeObject(obj, spesipik[0], autoSet);
		}
	}
	public static FindHas<T extends object>(obj: T, key: string): boolean {
		let spesipik: string[] = this.FindSpecificLocation(obj, key);
		if (spesipik.length == 0) {
			return false;
		}
		return true;
	}
	public FindAllAndRemove(Path: string): Record<string, T> | undefined {
		return EasyDB.FindAllAndRemove(this.db, Path, true);
	}
	public static FindAllAndRemove<T extends object>(
		obj: T,
		Path: string,
		autoSet: boolean = true,
	): T | undefined {
		let spesipik: string[] = this.FindSpecificLocation(obj, Path);
		let MyDb: T = JSON.parse(JSON.stringify(obj));
		if (spesipik.length == 0) {
			return undefined;
		}
		for (const index of spesipik) {
			this.removeObject(autoSet ? obj : MyDb, index, true);
		}
		return autoSet ? obj : MyDb;
	}
	public FindAndSet(
		Path: string,
		value: any,
	): Record<string, T> | undefined {
		return EasyDB.FindAndSet(this.db, Path, value, true);
	}
	public static FindAndSet<T extends object, V = any>(
		obj: T,
		Path: string,
		value: any,
		autoSet?: boolean,
	): V | undefined {
		let spesipik: string[] = this.FindSpecificLocation(obj, Path);
		if (spesipik.length == 0) {
			return undefined;
		}
		obj = this.setObject(obj, spesipik[0], value, autoSet);
		return obj as unknown as V;
	}
	public static FindAndSetWithPath<T extends object>(
		obj: T,
		Path: string,
		path: string,
		value: any,
		autoSet?: boolean,
	): T | undefined {
		let spesipik: string[] = this.FindSpecificLocation(obj, Path);
		if (spesipik.length == 0) {
			return undefined;
		}
		obj = this.setObject(
			obj,
			`${spesipik[0]}.${path}`,
			value,
			autoSet,
		);
		return obj;
	}
	public FindAllAndSet(
		Path: string,
		value: any,
	): Record<string, T> | undefined {
		return EasyDB.FindAllAndSet(this.db, Path, value, true);
	}
	public static FindAllAndSet<T extends object>(
		obj: T,
		Path: string,
		value: any,
		autoSet?: boolean,
	): T | undefined {
		let spesipik: string[] = this.FindSpecificLocation(obj, Path);
		let MyDb: T = JSON.parse(JSON.stringify(obj));
		if (spesipik.length == 0) {
			return undefined;
		}
		for (const index of spesipik) {
			this.setObject(autoSet ? obj : MyDb, index, value, true);
		}
		return autoSet ? obj : MyDb;
	}
	public FindAllAndGet<Value>(key: string): Value {
		return EasyDB.FindAllAndGet(this.db, key);
	}
	public static FindAllAndGet<T extends object, Value>(
		obj: T,
		key: string,
	): Value {
		return this.FindSpecificLocation(obj, key)
			.map((value) => {
				let conditions: Array<string> = this.ParseCondition(
					key,
				).map((v) => v.key);
				if (
					!value.endsWith(
						conditions[conditions.length - 1],
					)
				) {
					value = value.split(
						conditions[conditions.length - 1],
					)[0];
					value =
						(value.endsWith(".")
							? value.substring(
									0,
									value.length - 1,
							  )
							: value) +
						"." +
						conditions[conditions.length - 1];
				}
				return {[value]: this.getObject(obj, value)};
			})
			.reduce((acc, cur) => {
				return {...acc, ...cur};
			}, {}) as unknown as Value;
	}
	public FindAndGet<V>(key: string): V {
		return EasyDB.FindAndGet(this.db, key);
	}
	public static FindAndGet<T extends object, Value>(
		obj: T,
		key: string,
	): Value {
		let hasil = this.FindAllAndGet(obj, key) as any;
		return {
			[Object.keys(hasil)[0]]: hasil[Object.keys(hasil)[0]],
		} as unknown as Value;
	}
	public static FindSpecificLocation<T extends object>(
		obj: T,
		located: string,
	): Array<string> {
		let conditions: Conditions[] = this.ParseCondition(located);
		let patern: Array<string> = this.GetAllPathsLocated(obj);
		let check: string = "";
		if (conditions.every((value) => value.status == "key")) {
			check = conditions.map((v) => v.key).join(".");
		} else {
			let result: string = "";
			conditions.forEach((value) => {
				if (value.status == "key") {
					result += `${value.key}.`;
				} else if (value.status == "array") {
					result = `${
						result.endsWith(".")
							? result.substring(
									0,
									result.length -
										1,
							  )
							: ""
					}[${value.index}].`;
				} else if (value.status == "all") {
					result = `${
						result.endsWith(".")
							? result.substring(
									0,
									result.length -
										1,
							  )
							: ""
					}(.*)${value.key}.`;
				}
			});
			result = result.endsWith(".")
				? result.substring(0, result.length - 1)
				: result;
			check = result;
		}
		return patern
			.filter((value) => new RegExp(check, "g").test(value))
			.filter((value) => EasyDB.hasObject(obj, value));
	}
	private static DeepObject<T extends object>(obj: T): Array<string> {
		return Object.keys(obj)
			.filter((key) => obj[key as keyof T] instanceof Object)
			.map((key) =>
				this.DeepObject(
					obj[key as keyof T] as unknown as T,
				).map((k) => `${key}.${k}`),
			)
			.reduce((x, y) => x.concat(y), Object.keys(obj));
	}
	public static GetAllPathsLocated<T extends object>(
		obj: T,
	): Array<string> {
		let result: Array<string> = [];
		for (let key of this.DeepObject(obj)) {
			let keys: Array<string> = key.split(".");
			let newKey: string = "";
			keys = keys.map((value) => {
				if (isNaN(parseInt(value))) {
					return value;
				} else {
					return `[${value}]`;
				}
			});
			keys.forEach((value) => {
				if (/^\[\d+\]$/.test(value)) {
					newKey = `${
						newKey.endsWith(".")
							? newKey.substring(
									0,
									newKey.length -
										1,
							  )
							: ""
					}${value}.`;
				} else {
					newKey += value + ".";
				}
			});
			newKey = newKey.endsWith(".")
				? newKey.substring(0, newKey.length - 1)
				: newKey;
			result.push(newKey);
		}
		return result;
	}
	private static ParseCondition(conditions: string): Conditions[] {
		let condition: string[] = conditions.split(".");
		let newCondition: Conditions[] = [];
		condition.forEach((value, index) => {
			index = index + 1;
			if (value.includes("[")) {
				newCondition.push({
					key: value.split("[")[0],
					index: parseInt(
						value.split("[")[1].split("]")[0],
					),
					status: "array",
					inLocated: index,
				});
			} else if (value.startsWith("*")) {
				newCondition.push({
					key: value.substring(1),
					status: "all",
					inLocated: index,
				});
			} else {
				newCondition.push({
					key: value,
					status: "key",
					inLocated: index,
				});
			}
		});
		newCondition = newCondition.sort(
			(a, b) => a.inLocated - b.inLocated,
		);
		return newCondition;
	}
	public remove(key: string | Array<string>): void {
		if (typeof key === "string") {
			delete this.db[key];
		} else if (Array.isArray(key)) {
			let data: [string, T][] = lodash.entries(this.db);
			data.forEach((item: [string, T], i: number) => {
				if (typeof item[1] === "object") {
					let keys: Array<string> = lodash.keys(
						item[1],
					);
					if (
						keys.every((value) =>
							key.includes(value),
						)
					) {
						delete this.db[item[0]];
					}
				} else if (
					typeof item[1] === "string" &&
					key.includes(item[1])
				) {
					delete this.db[item[0]];
				}
			});
		} else {
			throw new Error("key not supported type");
		}
	}
	public removeByKeys(keys: string): void {
		if (this.db.hasOwnProperty(keys)) {
			delete this.db[keys];
		}
	}
	public update(key: keyof T, value: T): void {
		if (this.db.hasOwnProperty(key)) {
			this.db[key as string] = value;
		} else {
			throw new Error("key not found");
		}
	}
	public reset(): void {
		this.db = {};
	}
	public get toArray(): T[] {
		return lodash.values(this.db);
	}
	public get all() {
		return this.db;
	}
}
