import type Logger from "../log";
import type Whatsapp from "../types";
export declare class Events {
    private location;
    private db;
    private file;
    private log;
    private static instance;
    private constructor();
    static getEvents(): Events;
    setLog(log: Logger): void;
    setLocFolder(path: string): void;
    private getFile;
    load(): Promise<void>;
    clear(): void;
    getCommandLeaking: () => Promise<void>;
    commandCall(client: Whatsapp.ClientType, callback?: (client: Whatsapp.ClientType) => void): Promise<unknown>;
    private forFile;
    private isClass;
    setCommand(key: string, value: any): void;
    deleteCmd(key: string): void;
    getCmd(key: string): unknown;
    get allEvents(): Record<string, Whatsapp.MyEvents>;
    updateCmd(key: keyof Whatsapp.MyEvents, value: any): undefined;
    refresh(): Promise<void>;
    setToArrayEvents(): Array<Whatsapp.CommandEvents>;
}
