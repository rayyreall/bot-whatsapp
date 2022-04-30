import { DeleteResult, OptionalId, Document, Collection } from "mongodb";
import type { MongoConnect, MongoOptions } from "../../types";
import Log from "../../log";
import type { WASocket } from "@adiwajshing/baileys";
export default class MongoDB implements MongoConnect {
    private url;
    private runScript?;
    private config?;
    private db;
    private static instance;
    database: import("mongodb").Db;
    private constructor();
    private log;
    static createDB(url?: string, runScript?: (sessions: string, logger: Log) => Promise<WASocket>, config?: MongoOptions): MongoDB;
    Utility: <T extends Log>(log: T) => void;
    collection: (key: string) => Collection<Document>;
    removeAll: (key: string) => Promise<DeleteResult>;
    has: (key: string) => Promise<boolean>;
    update: <T>(key: string, keyDb: any, obj: T) => Promise<import("mongodb").UpdateResult>;
    get: <T extends object>(key: string, keyDb: T) => Promise<import("mongodb").WithId<Document> | null>;
    insert: (key: string, obj: OptionalId<Document>) => Promise<import("mongodb").InsertOneResult<Document>>;
    delete: (key: string, keyDb: any) => Promise<DeleteResult>;
    connect: (reset?: string | undefined) => Promise<void>;
}
