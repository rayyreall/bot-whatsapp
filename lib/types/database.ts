import type Log from "../log";

export interface MongoConnect {
	connect: () => void;
}

export interface MongoOptions {
	sessions: string;
	logger: Log;
}
