/// <reference types="node" />
import type { MimeType } from "file-type";
export declare namespace API {
    interface IConfigSticker {
        author: string;
        pack: string;
        keepScale: boolean;
        removebg: string;
        circle: boolean;
    }
    interface ConfigStickerVideo extends IConfigSticker {
        video: Partial<IVideoConfigSticker>;
    }
    interface IVideoConfigSticker {
        crop: boolean;
        fps: number;
        startTime: string;
        endTime: string;
        loop: number;
    }
    interface ILoadSticker {
        file: Buffer;
        mime: MimeType;
    }
    type IMetadataSticker = {
        stickerMetadata: IConfigSticker;
        processOptions?: IVideoConfigSticker;
    };
    interface Controller {
        sticker: typeof import("../routers/api").Sticker;
    }
}
