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
    }
    async execute(client) {
        let data = client;
        const { from, id, querry } = client;
        /*
        const a = async () => {
            throw new Error("error")
        }
        const b =async () => {
           await this.utils!.Delay(7000)
            throw "aku"
        }
        const c = async () => {
            await this.utils!.Delay(10000)
            throw "aku"
        }
        const d = async () => {
            await this.utils!.Delay(9000)
            throw "aku"
        }
        const e = async (su: string) => {
            return su
        }
        let u = await this.utils!.ErrorHandle([a,b,c,d,e], [[], [], [], [], [querry]], {
            description: [
                "Terjadi kesalahan pada engine a, tunggu beberapa saat bot sedang menguji engine b",
                "Terjadi kesalahan pada engine b, tunggu beberapa saat bot sedang menguji engine c",
                "Terjadi kesalahan pada engine c, tunggu beberapa saat bot sedang menguji engine d",
                "Terjadi kesalahan pada engine d, tunggu beberapa saat bot sedang menguji engine e",
                "Terjadi kesalahan pada engine e, tunggu beberapa saat bot sedang menguji engine f",
            ]
        }, async (att, desk) => {
            await client.reply(from, `Terdeteksi Kegagalan ${att}, ${desk}`, id)
        }).catch(err => {
            throw err
        })
        return await client.reply(from, "bot sudah mendapatkan respon dari engine e : " + u, id)
        */
        let d = { ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize() };
        setInterval(() => {
            d = { ...d, ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize(), ...client.GetSerialize() };
        }, 1000);
    }
};
__decorate([
    (0, _1.Get)("utils"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    (0, _1.Config)({
        command: "test",
        isOwner: true,
    }),
    __metadata("design:paramtypes", [])
], default_1);
exports.default = default_1;
