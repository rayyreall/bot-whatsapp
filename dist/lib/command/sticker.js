"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importStar(require("."));
let default_1 = class default_1 extends _1.default {
    constructor() {
        super();
        this.parse = (str) => {
            if (str.search(/\|/g) != -1) {
                return str
                    .split("|")
                    .map((x) => x.trim())
                    .reduce((a, b) => {
                    if (typeof a.author == "undefined")
                        a.author = b;
                    else if (typeof a.pack == "undefined")
                        a.pack = b;
                    return a;
                }, {});
            }
            else {
                return { pack: str };
            }
        };
    }
    async execute(client) {
        const { args, from, id, realOwner, media } = client;
        console.log({ media });
        await client.wait(from, id);
        let file = await client.decryptMedia(media);
        let api = await new (this.API("sticker"))(file, args.length > 0
            ? this.parse(args.join(" "))
            : { author: "I`am Ra", pack: "RA BOT" })
            .build()
            .catch((err) => {
            if (err instanceof Error)
                client.reply(realOwner, String(err.stack));
            client.reply(from, "*「❗」*  Mohon Maaf kak bot gagal membuat sticker bot otomatis menghubungi Owner");
        });
        if (!api)
            throw new Error("Error Build To API");
        await client.sendFile(from, api, { quoted: id });
        file = null;
        api = void null;
    }
};
__decorate([
    (0, _1.Get)("API", "utils"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    (0, _1.Config)({
        command: ["sticker", "s", "stiker"],
        isMedia: true,
        help: ["sticker"],
        group: "converter",
        errorHandle: {
            attempts: 3,
            warningUser: true,
        },
        description: "<author|pack>",
        eventName: "sticker"
    }),
    __metadata("design:paramtypes", [])
], default_1);
exports.default = default_1;
