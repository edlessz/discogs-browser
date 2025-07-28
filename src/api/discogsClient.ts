import axios from "axios";

const discogsClient = axios.create({
	baseURL: "https://api.discogs.com",
	params: {
		per_page: 100,
	},
});

let rateLimitRemaining = Infinity;
let isThrottled = false;
const requestQueue: (() => void)[] = [];

const processQueue = () => {
	while (requestQueue.length && !isThrottled) {
		const nextRequest = requestQueue.shift();
		if (nextRequest) nextRequest();
	}
};

discogsClient.interceptors.request.use((config) => {
	return new Promise((resolve) => {
		const attemptRequest = () => {
			resolve(config);
		};

		if (isThrottled) {
			requestQueue.push(attemptRequest);
		} else {
			attemptRequest();
		}
	});
});

discogsClient.interceptors.response.use(
	(response) => {
		const remainingHeader = response.headers["x-discogs-ratelimit-remaining"];
		rateLimitRemaining = remainingHeader
			? parseInt(remainingHeader, 10)
			: Infinity;

		// Throttle if remaining calls are very low
		if (rateLimitRemaining <= 2) {
			isThrottled = true;
			setTimeout(() => {
				isThrottled = false;
				processQueue();
			}, 2000); // pause 2 seconds before releasing queue
		} else {
			processQueue();
		}

		return response;
	},
	(error) => {
		// Optionally handle errors, e.g., retry 429
		return Promise.reject(error);
	},
);

export default discogsClient;
