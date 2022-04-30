import type { OptionsLogger, myLogger } from "../types";
export default class Logger implements myLogger {
    private options;
    private setColor;
    constructor(options: OptionsLogger);
    readonly info: (message: any, ...args: any[]) => void;
    readonly error: (message: any, ...args: any[]) => void;
    readonly warn: (message: any, ...args: any[]) => void;
    readonly debug: (...args: any[]) => void;
    protected readonly hasColor: Function;
}
