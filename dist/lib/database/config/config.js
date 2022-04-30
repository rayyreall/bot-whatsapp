"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VERSION = exports.DEFAULT_URL_WA_VERSIONS = exports.fetchNewWAVersions = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchNewWAVersions = async () => {
    try {
        const fetchData = await axios_1.default.get(exports.DEFAULT_URL_WA_VERSIONS);
        return fetchData.data.currentVersion.split(".").map((version) => parseInt(version));
    }
    catch (e) {
        throw e;
    }
};
exports.fetchNewWAVersions = fetchNewWAVersions;
exports.DEFAULT_URL_WA_VERSIONS = "https://web.whatsapp.com/check-update?version=1&platform=web";
exports.DEFAULT_VERSION = [2, 2214, 9];
