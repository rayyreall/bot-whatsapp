"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const run = async () => {
    const db = utils_1.LocalDatabase.create("./lib/database", "whatsappkey");
    await db.connect();
    process.on("message", async (data) => {
        if (typeof data == "object") {
            switch (data.id) {
                case "write.db":
                    {
                        await db.createArray(data.content.key);
                        await db.updateArray(data.content.key, data.content.data);
                        process.send?.({ id: "success.write.id" });
                    }
                    break;
                case "getdb":
                    {
                        process.send?.({ ...data, content: await db.getArray(data.key) });
                    }
                    break;
            }
        }
    });
};
run();
