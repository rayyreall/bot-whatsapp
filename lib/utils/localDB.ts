import { AceBase, DataReference  } from "acebase";
import * as fs from "fs";
import path from "path";
import Bluebird from 'bluebird';


interface DirectoryDatabase {
    folder: string;
    name: string;
}
export class LocalDatabase {
    private directory: DirectoryDatabase;
    private static db: LocalDatabase;
    public readonly local: AceBase;
    public status: boolean = false;
    private constructor(folderPath: string, name: string) {
        this.directory  ={
            folder: folderPath,
            name: name
        }
        this.local = new AceBase(this.directory.name, {
            logLevel: "error",
            storage: {
                path: path.join(this.directory.folder)
            }
        });
        this.local.ready(() => {
            this.status = true;
        })
    }
    public static create (folderPath: string, filename: string) {
        if (!LocalDatabase.db) {
            LocalDatabase.db = new LocalDatabase(folderPath, filename);
        }
        return LocalDatabase.db;
    }
    public connect = async () => {
        return await this.local.ready();
    }
    public updateMap = async (key: string, index: string, value: any) => {
        if (!this.status) throw new Error("Database is not ready");
        return new Bluebird<boolean>(async(resolve) => {
            await this.local.ref(key).transaction(async snap => {
                return new Bluebird ((r) => {
                    let metadata = snap.val();
                    metadata[index] = value
                    r(metadata);
                    metadata = null
                })
            })
            resolve(true);
        })
    }
    public getMap = async (key: string) => {
        return new Bluebird(async (resolve) => {
            if (!this.status) throw new Error("Database is not ready");
            this.local.ref(key).get(async snapshot => {
                if (!snapshot.exists()) {
                    await this.local.ref(key).set({});
                }
                return resolve(snapshot.val());
            })
        })
    }
    public createMap = async (key: string) => {
        if (!this.status) throw new Error("Database is not ready");
        return new Bluebird(async (resolve) => {
            this.local.ref(key).get(async snap => {
                if (!snap.exists()) {
                    await this.local.ref(key).set({});
                }
                resolve(true)
            })
        })
    }
    public createArray = async (key: string): Promise<boolean> => {
        if (!this.status) throw new Error("Database is not ready");
        return new Bluebird<boolean>(async(resolve) => {
            this.local.ref(key).get(async snapshot => {
                if (!snapshot.exists()) {
                    await this.local.ref(key).set([]);
                }
                resolve(true);
            })
        })
    }
    public removeArray = async <T = any>(key: string, func: (value: T) => boolean): Promise<void> => {
        if (!this.status) throw new Error("Database is not ready");
        await this.local.ref(key).transaction(async snap => {
            return new Bluebird((resolve) => {
                let metadata: Array<T> | null = snap.val();
                let index: number = metadata!.findIndex(func);
                if (index > -1) metadata!.splice(index, 1);
                resolve(metadata);
                metadata = null;
            })
        })
    }
    public updateArray = async <T> (key: string, value: T): Promise<boolean> => {
        if (!this.status) throw new Error("Database is not ready");
        return new Bluebird<boolean>(async(resolve) => {
            await this.local.ref(key).transaction(async snap => {
                return new Bluebird ((r) => {
                    let metadata = snap.val();
                    metadata.push(value);
                    r(metadata);
                    metadata = null
                })
            })
            resolve(true);
        })
    }
    public getArray = async (key: string) => {
        return new Bluebird(async (resolve) => {
            if (!this.status) throw new Error("Database is not ready");
            this.local.ref(key).get(async snapshot => {
                if (!snapshot.exists()) {
                    await this.local.ref(key).set([]);
                }
                return resolve(snapshot.val());
            })
        })
    }
}