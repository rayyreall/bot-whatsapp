"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(isOpen = false) {
        this.isOpen = isOpen;
    }
    execute(data) {
        return null;
    }
    get events() {
        return this.config;
    }
    tester() {
        return "halo";
    }
    run(data) {
        return null;
    }
}
exports.default = Command;
