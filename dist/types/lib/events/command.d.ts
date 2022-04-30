import type Whatsapp from "../types";
import * as utils from "../utils";
import axios from "axios";
import Log from "../log";
import Controller from "../routers/controllers";
import { Events } from "../events";
export default class Command implements Whatsapp.CommandDefault {
    private isOpen;
    constructor(isOpen?: boolean);
    private config?;
    execute(data: Whatsapp.ClientType): any;
    get events(): Partial<Whatsapp.MyEvents> | undefined;
    tester(): string;
    run(data: Whatsapp.ClientType): any;
    protected utils?: typeof utils;
    protected request?: typeof axios;
    protected logger?: Log;
    protected API?: typeof Controller;
    protected ev?: Events;
}
