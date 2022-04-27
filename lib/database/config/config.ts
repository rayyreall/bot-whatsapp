import axios from "axios";
import type {AxiosResponse} from "axios";

export const fetchNewWAVersions = async (): Promise<
	[number, number, number]
> => {
	try {
		const fetchData: AxiosResponse = await axios.get(DEFAULT_URL_WA_VERSIONS);
		return (fetchData.data.currentVersion.split(".") as Array<string>).map(
			(version) => parseInt(version),
		) as [number, number, number];
	} catch (e) {
		throw e;
	}
};
export const DEFAULT_URL_WA_VERSIONS: string =
	"https://web.whatsapp.com/check-update?version=1&platform=web";

export const DEFAULT_VERSION: [number, number, number] = [2, 2214, 9];
