import type { API } from "../../types";
export default function Controller<T extends keyof API.Controller>(k: T): API.Controller[T];
