import path from "path";
import lodash from "lodash";



(async () => {
	let p = () => new Promise((resolve) => setTimeout(() => {
		console.log("end")
	}, 5000))
	console.log("j")
	p()
	console.log("p")
	console.log("k")
})();