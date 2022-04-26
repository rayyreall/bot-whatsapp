import type Whatsapp from "../types";
import * as utils from "../utils";
import axios from "axios";
import Log from "../log";

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
	protected get utils(): typeof utils {
		return utils;
	}
	protected get request(): typeof axios {
		return axios;
	}
	protected get Logger(): typeof Log {
		return Log;
	}
}
