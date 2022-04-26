import path from "path";
import lodash from "lodash";
import NodeCache from "node-cache";
import Command, {Config, Get} from "../events";
import type Whatsapp from "../types";

class h {
	constructor() {}
	public utils: any | undefined;
	@Get("utils")
	metode() {
		console.log(this.utils);
	}
}
(async () => {
	new h().metode();
})();
