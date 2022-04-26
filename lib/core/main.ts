import WASocket, {useSingleFileAuthState} from "@adiwajshing/baileys";
import EsPino from "pino";
import {fetchNewWAVersions, DEFAULT_VERSION} from "../database/config";
import type {WASocket as Socket} from "@adiwajshing/baileys";
import Events from "./events";
import Log from "../log";
import type Whatsapp from "../types";

let states: ReturnType<typeof useSingleFileAuthState> | undefined;
export default async function createWA(
	sessions: string,
	logger: Log,
): Promise<Socket> {
	if (!states) states = useSingleFileAuthState(sessions);
	const sock: Socket = WASocket({
		printQRInTerminal: true,
		auth: states.state,
		version: await fetchNewWAVersions().catch(() => DEFAULT_VERSION),
		logger: EsPino({
			level: "silent",
			enabled: false,
			levelVal: 100,
		}),
	});
	const events: Whatsapp.EventsOperator = new Events(
		sock,
		states.saveState,
		sessions,
	);
	events.setUtils(logger);
	if (typeof sock.ev.on === "function") events.operator();
	return sock;
}
