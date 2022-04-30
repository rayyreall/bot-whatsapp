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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const pino_1 = __importDefault(require("pino"));
const config_1 = require("../database/config");
const events_1 = __importDefault(require("./events"));
let Auth;
async function createWA(sessions, logger) {
    if (!Auth)
        Auth = (0, baileys_1.useSingleFileAuthState)(sessions);
    const sock = (0, baileys_1.default)({
        printQRInTerminal: true,
        auth: Auth.state,
        version: await (0, config_1.fetchNewWAVersions)().catch(() => config_1.DEFAULT_VERSION),
        logger: (0, pino_1.default)({
            level: "silent",
            enabled: false,
            levelVal: 100,
        }),
    });
    const events = new events_1.default(sock, () => void 0, sessions);
    events.setUtils(logger);
    if (typeof sock.ev.on === "function")
        events.operator();
    return sock;
}
exports.default = createWA;
