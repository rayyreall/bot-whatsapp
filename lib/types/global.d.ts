export type ProcessModel = "dev" | "client";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			mode: ProcessModel;
			memory: "low" | "warn" | "medium" | "leak" | "danger" ;
		}
	}
}
