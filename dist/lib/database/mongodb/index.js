"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class MongoDB {
    constructor(url, runScript, config) {
        this.url = url;
        this.runScript = runScript;
        this.config = config;
        this.Utility = (log) => {
            this.log = log;
        };
        this.collection = (key) => {
            return this.database.collection(key);
        };
        this.removeAll = async (key) => {
            return await this.collection(key).deleteMany({});
        };
        this.has = async (key) => {
            const result = await this.collection(key).findOne({});
            return !!result;
        };
        this.update = async (key, keyDb, obj) => {
            return await this.collection(key).updateOne(keyDb, { $set: obj });
        };
        this.get = async (key, keyDb) => {
            return await this.collection(key).findOne(keyDb);
        };
        this.insert = async (key, obj) => {
            return await this.collection(key).insertOne({ ...obj });
        };
        this.delete = async (key, keyDb) => {
            return await this.collection(key).deleteOne(keyDb);
        };
        this.connect = async (reset) => {
            this.db.once("open", async () => {
                this.log.info("Connected to MongoDB");
                if (typeof this.runScript == "function") {
                    this.log.info("Run Whatsapp bot");
                    if (reset)
                        await this.removeAll(reset);
                    await this.runScript(this.config.sessions, this.log).catch((e) => this.log.error(e));
                }
            });
            this.db.once("close", () => {
                this.log.info("Disconnected from MongoDB");
            });
            this.db.once("error", (err) => {
                this.log.error(err);
            });
            try {
                await this.db.connect();
            }
            catch (err) {
                if (err instanceof Error) {
                    this.log.error(err);
                    process.exit(1);
                }
            }
        };
        this.db = new mongodb_1.MongoClient(this.url);
        this.database = this.db.db("mydb");
    }
    static createDB(url, runScript, config) {
        if (!MongoDB.instance) {
            if (!url)
                throw new Error("No url provided");
            MongoDB.instance = new MongoDB(url, runScript, config);
        }
        return MongoDB.instance;
    }
}
exports.default = MongoDB;
