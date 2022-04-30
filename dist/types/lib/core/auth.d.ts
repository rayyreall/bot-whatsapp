import { SignalDataTypeMap, SignalDataSet } from "@adiwajshing/baileys";
import MongoDB from "../database/mongodb";
export declare const MongoAuth: (db: MongoDB, sessions: string) => Promise<{
    state: {
        creds: any;
        keys: {
            get: (type: keyof SignalDataTypeMap, ids: Record<string, any>) => any;
            set: (data: SignalDataSet) => Promise<void>;
        };
    };
    saveState: () => undefined;
}>;
