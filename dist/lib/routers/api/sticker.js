"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sticker = void 0;
const axios_1 = __importDefault(require("axios"));
const file_type_1 = __importDefault(require("file-type"));
const bluebird_1 = __importDefault(require("bluebird"));
const utils_1 = require("../../utils");
const lodash_1 = __importDefault(require("lodash"));
class Sticker {
    constructor(file, config = {
        author: "I`am Ra",
        pack: "RA BOT",
    }) {
        this.load = async () => {
            return new bluebird_1.default(async (resolve) => {
                let files = await (0, utils_1.toBuffer)(this.file);
                if (!files)
                    throw new Error(`Your media file is not a valid file`);
                resolve({ file: files, mime: (await file_type_1.default.fromBuffer(files)).mime });
                this.file = undefined;
                files = null;
            });
        };
        this.build = async () => {
            return new bluebird_1.default(async (resolve, reject) => {
                let file = await this.load();
                (0, axios_1.default)({
                    url: `${Sticker.DEFAULT_URL}${file.mime.startsWith("image")
                        ? "prepareWebp"
                        : "convertMp4BufferToWebpDataUrl"}`,
                    method: "POST",
                    maxBodyLength: 20000000,
                    maxContentLength: 1500000,
                    headers: this.setHeaders,
                    data: JSON.stringify(Object.assign(this.createMetadata(file.mime), {
                        [`${file.mime.startsWith("image") ? "image" : "file"}`]: `data:${file.mime};base64,${file.file.toString("base64")}`,
                    })),
                })
                    .then((respon) => {
                    resolve(file.mime.startsWith("image")
                        ? respon.data.webpBase64
                        : respon.data);
                })
                    .catch((err) => {
                    file = null;
                    reject(err);
                })
                    .finally(() => {
                    file = null;
                });
            });
        };
        this.createMetadata = (mime) => {
            if (typeof this.config.author === "undefined")
                this.config.author = "ㅤ";
            if (typeof this.config.pack === "undefined")
                this.config.pack = "ㅤ";
            if (typeof this.config.keepScale === "undefined")
                this.config.keepScale = true;
            if (typeof this.config.circle === undefined)
                this.config.circle = false;
            if (typeof this.config.video === "undefined")
                this.config.video = {};
            if (typeof this.config.video.crop === "undefined")
                this.config.video.crop = this.config.keepScale;
            if (typeof this.config.video.fps === "undefined")
                this.config.video.fps = 10;
            if (typeof this.config.video.startTime === "undefined")
                this.config.video.startTime = "00:00:00";
            if (typeof this.config.video.endTime === "undefined")
                this.config.video.endTime = "00:00:7.0";
            if (typeof this.config.video.loop === "undefined")
                this.config.video.loop = 0;
            return (mime.startsWith("image")
                ? { stickerMetadata: lodash_1.default.omit(this.config, "video") }
                : {
                    processOptions: this.config.video,
                    stickerMetadata: lodash_1.default.omit(this.config, "video"),
                });
        };
        this.file = file;
        this.config = config;
    }
    get setHeaders() {
        return {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json;charset=utf-8",
            "User-Agent": "WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
        };
    }
}
exports.Sticker = Sticker;
Sticker.DEFAULT_URL = "https://sticker-api.openwa.dev/";
