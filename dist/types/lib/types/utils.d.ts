export interface Database<T> {
    add(key: string, value: T): void;
    remove(key: string | Array<string>): void;
    removeByKeys(keys: string): void;
    Get(key: string): T | null | undefined;
    searchDB<T>(key: string | Array<string>, output?: any): T | undefined;
    update(key: keyof T, value: T): void;
    has(key: string): boolean;
}
export declare type StatusCondition = "all" | "key" | "array";
export interface Conditions {
    key: string;
    status: StatusCondition;
    inLocated: number;
    index?: number;
}
export declare type ConfigSetObject = Record<string, any>;
export interface Adabter<T> {
    write(data: T): void;
    read(): Promise<void>;
}
export interface OptionsAttemps {
    limitError: number;
    description: Array<string>;
}
export interface Prefix {
    isMatch: true;
    prefix: string;
    body: string;
}
export declare enum Memory {
    warn = 1,
    medium = 1,
    leak = 1,
    danger = 1
}
export declare type MemoryType = "low" | "warn" | "medium" | "leak" | "danger";
