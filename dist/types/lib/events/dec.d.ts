import type Whatsapp from "../types";
export declare function Config(config: Partial<Whatsapp.MyEvents>): <T extends new (...args: any[]) => {}>(constructor: T) => {
    new (...args: any[]): {
        [x: string]: any;
    };
} & T;
export declare function Get(require: keyof Whatsapp.TypeRequired, ...args: any[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
