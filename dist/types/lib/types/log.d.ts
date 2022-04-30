import type { ProcessModel } from "./global";
import type { Chalk } from "chalk";
export interface OptionsLogger {
    mode?: ProcessModel;
    color?: Array<ColorLevel>;
}
export interface ColorLevel {
    level: OptionsColor;
    color?: Chalk;
}
export declare type ColorConfig = {
    [key in LevelColor]: Chalk;
};
export declare type LevelColor = "info" | "warn" | "error" | "debug";
export declare type OptionsColor = Exclude<LevelColor, "debug">;
export declare type myLogger = Record<LevelColor, (message: any, ...args: any[]) => void>;
