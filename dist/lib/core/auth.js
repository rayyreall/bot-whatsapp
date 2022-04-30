"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAuth = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const KEY_MAP = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
};
// it supports mongo db but messages will be slower because it uses excess network
const MongoAuth = async (db, sessions) => {
    if (!(await db.has(sessions))) {
        await db.insert(sessions, { data: JSON.stringify({
                creds: (0, baileys_1.initAuthCreds)(),
                keys: {}
            }, baileys_1.BufferJSON.replacer, 2) });
    }
    return {
        state: {
            creds: JSON.parse((await db.get(sessions, {}))?.data, baileys_1.BufferJSON.reviver).creds,
            keys: {
                get: (type, ids) => {
                    return ids.reduce(async (dict, id) => {
                        let value = JSON.parse((await db.get(sessions, {}))?.data, baileys_1.BufferJSON.reviver)?.keys[KEY_MAP[type]]?.[id];
                        if (value) {
                            if (type === 'app-state-sync-key')
                                value = baileys_1.proto.AppStateSyncKeyData.fromObject(value);
                            dict[id] = value;
                        }
                        value = null;
                        return dict;
                    }, {});
                },
                set: async (data) => {
                    let result = JSON.parse((await db.get(sessions, {}))?.data, baileys_1.BufferJSON.reviver);
                    for (const _key in data) {
                        const key = KEY_MAP[_key];
                        let keys = result?.keys || {};
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                        await db.update(sessions, {}, { data: JSON.stringify({ creds: result.creds, keys: keys }, baileys_1.BufferJSON.replacer, 2) });
                        keys = null;
                    }
                    result = null;
                }
            }
        },
        saveState: () => void 0
    };
};
exports.MongoAuth = MongoAuth;
