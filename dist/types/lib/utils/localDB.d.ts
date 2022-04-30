import { AceBase } from "acebase";
export declare class LocalDatabase {
    private directory;
    private static db;
    readonly local: AceBase;
    status: boolean;
    private constructor();
    static create(folderPath: string, filename: string): LocalDatabase;
    connect: () => Promise<void>;
    updateMap: (key: string, index: string, value: any) => Promise<boolean>;
    getMap: (key: string) => Promise<unknown>;
    createMap: (key: string) => Promise<unknown>;
    createArray: (key: string) => Promise<boolean>;
    removeArray: <T = any>(key: string, func: (value: T) => boolean) => Promise<void>;
    updateArray: <T>(key: string, value: T) => Promise<boolean>;
    getArray: (key: string) => Promise<unknown>;
}
