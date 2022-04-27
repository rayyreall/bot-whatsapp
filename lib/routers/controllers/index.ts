import  { Sticker } from "../api";
import type { API } from "../../types";



export default function Controller <T extends keyof API.Controller> (k: T): API.Controller[T] {
    switch(k) {
        case"sticker": {
            return Sticker;
        }
        default:
            return null as unknown as API.Controller[T];
    }
}