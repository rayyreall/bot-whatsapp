export type ProcessModel = "dev" | "client";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			mode: ProcessModel;
		}
	}
}
