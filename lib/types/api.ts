import type { MimeType } from "file-type";


export namespace API {
    export interface IConfigSticker {
        author: string;
        pack: string;
        keepScale: boolean;
        removebg: string;
        circle: boolean
    }
    export interface ConfigStickerVideo extends IConfigSticker {
        video: Partial<IVideoConfigSticker>;
    }
    export interface IVideoConfigSticker {
        crop: boolean;
        fps: number;
        startTime: string;
        endTime: string;
        loop: number
    }
    export interface ILoadSticker {
        file: Buffer;
        mime: MimeType
    }
    export type IMetadataSticker = { stickerMetadata: IConfigSticker, processOptions?: IVideoConfigSticker}
    export interface Controller {
        "sticker": typeof import("../routers/api").Sticker;
    }
}