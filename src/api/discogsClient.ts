import axios from "axios";
import { API_CONFIG } from "./constants";

const discogsClient = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	params: {
		per_page: API_CONFIG.DEFAULT_PER_PAGE,
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
		if (rateLimitRemaining <= API_CONFIG.RATE_LIMIT_THRESHOLD) {
			isThrottled = true;
			setTimeout(() => {
				isThrottled = false;
				processQueue();
			}, API_CONFIG.THROTTLE_DELAY); // pause before releasing queue
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
