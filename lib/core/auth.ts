import { BufferJSON, initAuthCreds, SignalDataTypeMap, proto, AuthenticationCreds, AuthenticationState, SignalDataSet } from "@adiwajshing/baileys";
import * as fs from "fs";
import { Writer } from "@commonify/steno";
import MongoDB from "../database/mongodb";


const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
	'pre-key': 'preKeys',
	'session': 'sessions',
	'sender-key': 'senderKeys',
	'app-state-sync-key': 'appStateSyncKeys',
	'app-state-sync-version': 'appStateVersions',
	'sender-key-memory': 'senderKeyMemory'
}


// it supports mongo db but messages will be slower because it uses excess network
export const MongoAuth = async (db: MongoDB, sessions: string) => {
	if (!(await db.has(sessions))) {
		await db.insert(sessions, {	data: JSON.stringify({
			creds: initAuthCreds(),
			keys: {}
		}, BufferJSON.replacer, 2) });
	}
	return {
		state: {
			creds: JSON.parse((await db.get(sessions, {}))?.data, BufferJSON.reviver).creds,
			keys: {
				get: (type: keyof SignalDataTypeMap, ids: Record<string, any>) => {
					return  ids.reduce(
						async (dict: any, id: any) => {
							let value = JSON.parse((await db.get(sessions, {}))?.data, BufferJSON.reviver)?.keys[KEY_MAP[type]]?.[id]
							if(value) {
								if(type === 'app-state-sync-key') value = proto.AppStateSyncKeyData.fromObject(value);
								dict[id] = value
							}
							value = null;
							return dict
						}, { }
					)
				},
				set: async (data: SignalDataSet) => {
					let result: {creds: AuthenticationCreds, keys: any} |null | undefined= JSON.parse((await db.get(sessions, {}))?.data, BufferJSON.reviver);
					for(const _key in data) {
						const key = KEY_MAP[_key as keyof SignalDataTypeMap];
						let keys = result?.keys || {};
						keys[key] = keys[key] || { };
						Object.assign(keys[key], (data as any)[_key] as any)
						await db.update(sessions, {}, { data: JSON.stringify({creds: result!.creds, keys: keys }, BufferJSON.replacer, 2) })
						keys = null;
					}
					result = null;
				}
			}
		},
		saveState: () => void 0
	}
}