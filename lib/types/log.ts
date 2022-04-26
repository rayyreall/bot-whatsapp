import type {ProcessModel} from "./global";
import type {Chalk} from "chalk";

export interface OptionsLogger {
	mode?: ProcessModel;
	color?: Array<ColorLevel>;
}
export interface ColorLevel {
	level: OptionsColor;
	color?: Chalk;
}
export type ColorConfig = {
	[key in LevelColor]: Chalk;
};

export type LevelColor = "info" | "warn" | "error" | "debug";
export type OptionsColor = Exclude<LevelColor, "debug">;
export type myLogger = Record<
	LevelColor,
	(message: any, ...args: any[]) => void
>;
