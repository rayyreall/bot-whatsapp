/// <reference types="node" />
import type { Readable } from "stream";
import type { API } from "../../types";
export declare class Sticker {
    private file;
    private config;
    static DEFAULT_URL: string;
    constructor(file: string | Buffer | Readable, config?: Partial<API.IConfigSticker & API.ConfigStickerVideo>);
    private get setHeaders();
    private load;
    build: () => Promise<string>;
    private createMetadata;
}
