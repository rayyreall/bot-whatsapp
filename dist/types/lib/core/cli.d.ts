/// <reference types="node" />
import { Readable } from "stream";
import type Whatsapp from "../types";
import type { WASocket } from "@adiwajshing/baileys";
import { proto } from "@adiwajshing/baileys";
export default class BulilderMetadata<T extends proto.IMessage> {
    private sock;
    private metadata;
    constructor(sock: WASocket);
    setImage(): BulilderMetadata<T>;
    setVideo(): BulilderMetadata<T>;
    setProto(name: string): BulilderMetadata<T>;
    setAudio(): BulilderMetadata<T>;
    setSticker(): BulilderMetadata<T>;
    setButtons(): BulilderMetadata<T>;
    setDocument(): BulilderMetadata<T>;
    setText(): BulilderMetadata<T>;
    setFrom(from: string): BulilderMetadata<T>;
    setContent(content: string | Buffer | Readable): BulilderMetadata<T>;
    setOptions(options: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createImage(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createVideo(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createAudio(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createButtons(from: string, content: Whatsapp.ButtonsContent, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createSticker(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createDocument(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    createText(from: string, content: string | Buffer | Readable, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    create(from: string, content: string | Buffer | Readable | Whatsapp.ButtonsContent, type: keyof Whatsapp.ContentData, options?: Whatsapp.IOptionsMessage): BulilderMetadata<T>;
    build(): Promise<proto.WebMessageInfo>;
}
