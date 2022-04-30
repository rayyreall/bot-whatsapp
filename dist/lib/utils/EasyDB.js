"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const _1 = require(".");
class EasyDB {
    constructor(yourDB) {
        this.yourDB = yourDB;
        if (this.yourDB) {
            this.db = this.yourDB;
        }
        else {
            this.db = {};
        }
    }
    DangerAccess(value) {
        this.db = value;
    }
    set(key, value) {
        this.db[key] = value;
    }
    readDB() {
        return this.db;
    }
    add(key, value) {
        if (this.db.hasOwnProperty(key)) {
            throw new Error("your keys duplicated in database");
        }
        this.db[key] = value;
    }
    static create() {
        return new EasyDB();
    }
    Get(key) {
        if (this.db.hasOwnProperty(key)) {
            return this.db[key];
        }
        else {
            return null;
        }
    }
    searchDB(key) {
        return (0, _1.searchJSON)(this.db, key);
    }
    has(key) {
        return this.db.hasOwnProperty(key);
    }
    hasObject(key) {
        return EasyDB.hasObject(this.db, key);
    }
    static hasObject(obj, key) {
        return lodash_1.default.has(obj, key);
    }
    static getObject(obj, key) {
        if (this.hasObject(obj, key)) {
            return lodash_1.default.get(obj, key);
        }
    }
    getObject(key) {
        return EasyDB.getObject(this.db, key);
    }
    setObject(config, value) {
        if (typeof config == "string") {
            return EasyDB.setObject(this.db, config, value);
        }
        return EasyDB.setObject(this.db, config);
    }
    static setObject(obj, config, value, autoSet = true) {
        let newConfig = JSON.parse(JSON.stringify(obj));
        if (!autoSet)
            Object.freeze(obj);
        if (typeof config == "string") {
            if (autoSet) {
                lodash_1.default.set(obj, config, value);
            }
            else {
                lodash_1.default.set(newConfig, config, value);
            }
        }
        else {
            for (const index in config) {
                if (autoSet)
                    lodash_1.default.set(obj, index, config[index]);
                else
                    lodash_1.default.set(newConfig, index, config[index]);
            }
        }
        if (autoSet)
            return obj;
        else
            return newConfig;
    }
    removeObject(key) {
        return EasyDB.removeObject(this.db, key, true);
    }
    static removeObject(obj, key, autoSet = true) {
        let newConfig = JSON.parse(JSON.stringify(obj));
        if (autoSet) {
            lodash_1.default.unset(obj, key);
            return obj;
        }
        else {
            lodash_1.default.unset(newConfig, key);
            return newConfig;
        }
    }
    FindAndRemove(key) {
        return EasyDB.FindAndRemove(this.db, key, true);
    }
    static FindAndRemove(obj, key, autoSet = true) {
        let spesipik = this.FindSpecificLocation(obj, key);
        if (spesipik.length == 0) {
            return undefined;
        }
        if (autoSet) {
            this.removeObject(obj, spesipik[0], autoSet);
            return obj;
        }
        else {
            return this.removeObject(obj, spesipik[0], autoSet);
        }
    }
    static FindHas(obj, key) {
        let spesipik = this.FindSpecificLocation(obj, key);
        if (spesipik.length == 0) {
            return false;
        }
        return true;
    }
    FindAllAndRemove(Path) {
        return EasyDB.FindAllAndRemove(this.db, Path, true);
    }
    static FindAllAndRemove(obj, Path, autoSet = true) {
        let spesipik = this.FindSpecificLocation(obj, Path);
        let MyDb = JSON.parse(JSON.stringify(obj));
        if (spesipik.length == 0) {
            return undefined;
        }
        for (const index of spesipik) {
            this.removeObject(autoSet ? obj : MyDb, index, true);
        }
        return autoSet ? obj : MyDb;
    }
    FindAndSet(Path, value) {
        return EasyDB.FindAndSet(this.db, Path, value, true);
    }
    static FindAndSet(obj, Path, value, autoSet) {
        let spesipik = this.FindSpecificLocation(obj, Path);
        if (spesipik.length == 0) {
            return undefined;
        }
        obj = this.setObject(obj, spesipik[0], value, autoSet);
        return obj;
    }
    static FindAndSetWithPath(obj, Path, path, value, autoSet) {
        let spesipik = this.FindSpecificLocation(obj, Path);
        if (spesipik.length == 0) {
            return undefined;
        }
        obj = this.setObject(obj, `${spesipik[0]}.${path}`, value, autoSet);
        return obj;
    }
    FindAllAndSet(Path, value) {
        return EasyDB.FindAllAndSet(this.db, Path, value, true);
    }
    static FindAllAndSet(obj, Path, value, autoSet) {
        let spesipik = this.FindSpecificLocation(obj, Path);
        let MyDb = JSON.parse(JSON.stringify(obj));
        if (spesipik.length == 0) {
            return undefined;
        }
        for (const index of spesipik) {
            this.setObject(autoSet ? obj : MyDb, index, value, true);
        }
        return autoSet ? obj : MyDb;
    }
    FindAllAndGet(key) {
        return EasyDB.FindAllAndGet(this.db, key);
    }
    static FindAllAndGet(obj, key) {
        return this.FindSpecificLocation(obj, key)
            .map((value) => {
            let conditions = this.ParseCondition(key).map((v) => v.key);
            if (!value.endsWith(conditions[conditions.length - 1])) {
                value = value.split(conditions[conditions.length - 1])[0];
                value =
                    (value.endsWith(".")
                        ? value.substring(0, value.length - 1)
                        : value) +
                        "." +
                        conditions[conditions.length - 1];
            }
            return { [value]: this.getObject(obj, value) };
        })
            .reduce((acc, cur) => {
            return { ...acc, ...cur };
        }, {});
    }
    FindAndGet(key) {
        return EasyDB.FindAndGet(this.db, key);
    }
    static FindAndGet(obj, key) {
        let hasil = this.FindAllAndGet(obj, key);
        return {
            [Object.keys(hasil)[0]]: hasil[Object.keys(hasil)[0]],
        };
    }
    static FindSpecificLocation(obj, located) {
        let conditions = this.ParseCondition(located);
        let patern = this.GetAllPathsLocated(obj);
        let check = "";
        if (conditions.every((value) => value.status == "key")) {
            check = conditions.map((v) => v.key).join(".");
        }
        else {
            let result = "";
            conditions.forEach((value) => {
                if (value.status == "key") {
                    result += `${value.key}.`;
                }
                else if (value.status == "array") {
                    result = `${result.endsWith(".") ? result.substring(0, result.length - 1) : ""}[${value.index}].`;
                }
                else if (value.status == "all") {
                    result = `${result.endsWith(".") ? result.substring(0, result.length - 1) : ""}(.*)${value.key}.`;
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
    static DeepObject(obj) {
        return Object.keys(obj)
            .filter((key) => obj[key] instanceof Object)
            .map((key) => this.DeepObject(obj[key]).map((k) => `${key}.${k}`))
            .reduce((x, y) => x.concat(y), Object.keys(obj));
    }
    static GetAllPathsLocated(obj) {
        let result = [];
        for (let key of this.DeepObject(obj)) {
            let keys = key.split(".");
            let newKey = "";
            keys = keys.map((value) => {
                if (isNaN(parseInt(value))) {
                    return value;
                }
                else {
                    return `[${value}]`;
                }
            });
            keys.forEach((value) => {
                if (/^\[\d+\]$/.test(value)) {
                    newKey = `${newKey.endsWith(".") ? newKey.substring(0, newKey.length - 1) : ""}${value}.`;
                }
                else {
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
    static ParseCondition(conditions) {
        let condition = conditions.split(".");
        let newCondition = [];
        condition.forEach((value, index) => {
            index = index + 1;
            if (value.includes("[")) {
                newCondition.push({
                    key: value.split("[")[0],
                    index: parseInt(value.split("[")[1].split("]")[0]),
                    status: "array",
                    inLocated: index,
                });
            }
            else if (value.startsWith("*")) {
                newCondition.push({
                    key: value.substring(1),
                    status: "all",
                    inLocated: index,
                });
            }
            else {
                newCondition.push({
                    key: value,
                    status: "key",
                    inLocated: index,
                });
            }
        });
        newCondition = newCondition.sort((a, b) => a.inLocated - b.inLocated);
        return newCondition;
    }
    remove(key) {
        if (typeof key === "string") {
            delete this.db[key];
        }
        else if (Array.isArray(key)) {
            let data = lodash_1.default.entries(this.db);
            data.forEach((item, i) => {
                if (typeof item[1] === "object") {
                    let keys = lodash_1.default.keys(item[1]);
                    if (keys.every((value) => key.includes(value))) {
                        delete this.db[item[0]];
                    }
                }
                else if (typeof item[1] === "string" && key.includes(item[1])) {
                    delete this.db[item[0]];
                }
            });
        }
        else {
            throw new Error("key not supported type");
        }
    }
    removeByKeys(keys) {
        if (this.db.hasOwnProperty(keys)) {
            delete this.db[keys];
        }
    }
    update(key, value) {
        if (this.db.hasOwnProperty(key)) {
            this.db[key] = value;
        }
        else {
            throw new Error("key not found");
        }
    }
    reset() {
        this.db = {};
    }
    get toArray() {
        return lodash_1.default.values(this.db);
    }
    get all() {
        return this.db;
    }
}
exports.default = EasyDB;
