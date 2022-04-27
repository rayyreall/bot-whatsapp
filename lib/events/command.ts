import type Whatsapp from "../types";
import * as utils from "../utils";
import axios from "axios";
import Log from "../log";
import Controller  from "../routers/controllers";
import { Events} from "../events";

export default class Command implements Whatsapp.CommandDefault {
	constructor(private isOpen: boolean = false) {}
	private config?: Partial<Whatsapp.MyEvents>;
	public execute(data: Whatsapp.ClientType): any {
		return null;
	}
	public get events() {
		return this.config;
	}
	public tester() {
		return "halo";
	}
	public run(data: Whatsapp.ClientType): any {
		return null;
	}
	protected utils?: typeof utils;
	protected request?: typeof axios;
	protected logger?: Log;
	protected API?: typeof Controller;
	protected ev?: Events
}
