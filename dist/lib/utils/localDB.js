"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalDatabase = void 0;
const acebase_1 = require("acebase");
const path_1 = __importDefault(require("path"));
const bluebird_1 = __importDefault(require("bluebird"));
class LocalDatabase {
    constructor(folderPath, name) {
        this.status = false;
        this.connect = async () => {
            return await this.local.ready();
        };
        this.updateMap = async (key, index, value) => {
            if (!this.status)
                throw new Error("Database is not ready");
            return new bluebird_1.default(async (resolve) => {
                await this.local.ref(key).transaction(async (snap) => {
                    return new bluebird_1.default((r) => {
                        let metadata = snap.val();
                        metadata[index] = value;
                        r(metadata);
                        metadata = null;
                    });
                });
                resolve(true);
            });
        };
        this.getMap = async (key) => {
            return new bluebird_1.default(async (resolve) => {
                if (!this.status)
                    throw new Error("Database is not ready");
                this.local.ref(key).get(async (snapshot) => {
                    if (!snapshot.exists()) {
                        await this.local.ref(key).set({});
                    }
                    return resolve(snapshot.val());
                });
            });
        };
        this.createMap = async (key) => {
            if (!this.status)
                throw new Error("Database is not ready");
            return new bluebird_1.default(async (resolve) => {
                this.local.ref(key).get(async (snap) => {
                    if (!snap.exists()) {
                        await this.local.ref(key).set({});
                    }
                    resolve(true);
                });
            });
        };
        this.createArray = async (key) => {
            if (!this.status)
                throw new Error("Database is not ready");
            return new bluebird_1.default(async (resolve) => {
                this.local.ref(key).get(async (snapshot) => {
                    if (!snapshot.exists()) {
                        await this.local.ref(key).set([]);
                    }
                    resolve(true);
                });
            });
        };
        this.removeArray = async (key, func) => {
            if (!this.status)
                throw new Error("Database is not ready");
            await this.local.ref(key).transaction(async (snap) => {
                return new bluebird_1.default((resolve) => {
                    let metadata = snap.val();
                    let index = metadata.findIndex(func);
                    if (index > -1)
                        metadata.splice(index, 1);
                    resolve(metadata);
                    metadata = null;
                });
            });
        };
        this.updateArray = async (key, value) => {
            if (!this.status)
                throw new Error("Database is not ready");
            return new bluebird_1.default(async (resolve) => {
                await this.local.ref(key).transaction(async (snap) => {
                    return new bluebird_1.default((r) => {
                        let metadata = snap.val();
                        metadata.push(value);
                        r(metadata);
                        metadata = null;
                    });
                });
                resolve(true);
            });
        };
        this.getArray = async (key) => {
            return new bluebird_1.default(async (resolve) => {
                if (!this.status)
                    throw new Error("Database is not ready");
                this.local.ref(key).get(async (snapshot) => {
                    if (!snapshot.exists()) {
                        await this.local.ref(key).set([]);
                    }
                    return resolve(snapshot.val());
                });
            });
        };
        this.directory = {
            folder: folderPath,
            name: name
        };
        this.local = new acebase_1.AceBase(this.directory.name, {
            logLevel: "error",
            storage: {
                path: path_1.default.join(this.directory.folder)
            }
        });
        this.local.ready(() => {
            this.status = true;
        });
    }
    static create(folderPath, filename) {
        if (!LocalDatabase.db) {
            LocalDatabase.db = new LocalDatabase(folderPath, filename);
        }
        return LocalDatabase.db;
    }
}
exports.LocalDatabase = LocalDatabase;
