import type { WASocket as Socket } from "@adiwajshing/baileys";
import Log from "../log";
export default function createWA(sessions: string, logger: Log): Promise<Socket>;
