"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
function Controller(k) {
    switch (k) {
        case "sticker": {
            return api_1.Sticker;
        }
        default:
            return null;
    }
}
exports.default = Controller;
