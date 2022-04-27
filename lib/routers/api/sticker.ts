import axios from "axios";
import mime from "file-type";
import Bluebird from "bluebird";
import {toBuffer} from "../../utils";
import lodash from "lodash";
import type {Readable} from "stream";
import type {MimeType} from "file-type";
import type {API} from "../../types";

export class Sticker {
	private file: string | Buffer | Readable | undefined;
	private config: Partial<API.IConfigSticker & API.ConfigStickerVideo>;
	public static DEFAULT_URL: string = "https://sticker-api.openwa.dev/";
	constructor(
		file: string | Buffer | Readable,
		config: Partial<API.IConfigSticker & API.ConfigStickerVideo> = {
			author: "I`am Ra",
			pack: "RA BOT",
		},
	) {
		this.file = file;
		this.config = config;
	}
	private get setHeaders() {
		return {
			Accept: "application/json, text/plain, /",
			"Content-Type": "application/json;charset=utf-8",
			"User-Agent":
				"WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
		};
	}
	private load = async (): Promise<API.ILoadSticker> => {
		return new Bluebird<API.ILoadSticker>(async (resolve) => {
			let files: Buffer | null = await toBuffer(this.file!);
			if (!files) throw new Error(`Your media file is not a valid file`);
			resolve({file: files!, mime: (await mime.fromBuffer(files!))!.mime});
			this.file = undefined;
			files = null;
		});
	};
	public build = async (): Promise<string> => {
		return new Bluebird<string>(async (resolve, reject) => {
			let file: API.ILoadSticker | null | Buffer = await this.load();
			axios({
				url: `${Sticker.DEFAULT_URL}${
					file.mime.startsWith("image")
						? "prepareWebp"
						: "convertMp4BufferToWebpDataUrl"
				}`,
				method: "POST",
				maxBodyLength: 20000000,
				maxContentLength: 1500000,
				headers: this.setHeaders,
				data: JSON.stringify(
					Object.assign(this.createMetadata(file.mime), {
						[`${file.mime.startsWith("image") ? "image" : "file"}`]: `data:${
							file.mime
						};base64,${file.file.toString("base64")}`,
					}),
				),
			})
				.then((respon) => {
					resolve(
						(file as API.ILoadSticker).mime.startsWith("image")
							? respon.data.webpBase64
							: respon.data,
					);
				})
				.catch((err) => {
					file = null;
					reject(err);
				})
				.finally(() => {
					file = null;
				});
		});
	};
	private createMetadata = (mime: MimeType): API.IMetadataSticker => {
		if (typeof this.config.author === "undefined") this.config.author = "ㅤ";
		if (typeof this.config.pack === "undefined") this.config.pack = "ㅤ";
		if (typeof this.config.keepScale === "undefined")
			this.config.keepScale = true;
		if (typeof this.config.circle === undefined) this.config.circle = false;
		if (typeof this.config.video === "undefined") this.config.video = {};
		if (typeof this.config.video.crop === "undefined")
			this.config.video.crop = this.config.keepScale;
		if (typeof this.config.video.fps === "undefined")
			this.config.video.fps = 10;
		if (typeof this.config.video.startTime === "undefined")
			this.config.video.startTime = "00:00:00";
		if (typeof this.config.video.endTime === "undefined")
			this.config.video.endTime = "00:00:7.0";
		if (typeof this.config.video.loop === "undefined")
			this.config.video.loop = 0;
		return (
			mime.startsWith("image")
				? {stickerMetadata: lodash.omit(this.config, "video")}
				: {
						processOptions: this.config.video,
						stickerMetadata: lodash.omit(this.config, "video"),
				  }
		) as API.IMetadataSticker;
	};
}
