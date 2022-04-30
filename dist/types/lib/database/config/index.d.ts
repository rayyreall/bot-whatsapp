import type { IConfig, Configurations } from "../../types";
export default class Config<T extends object = any> implements Configurations<T> {
    private static config;
    private db;
    private constructor();
    static create<K extends object = any>(): Config<K>;
    readJSON: (path: string) => void;
    get config(): IConfig & T;
    set(key: string, value: any): void;
    Set(key: any): undefined;
}
export * from "./config";
