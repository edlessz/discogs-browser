export const API_CONFIG = {
	BASE_URL: "https://api.discogs.com",
	DEFAULT_PER_PAGE: 100,
	RATE_LIMIT_THRESHOLD: 2,
	THROTTLE_DELAY: 2000,
} as const;

export const DISCOGS_URLS = {
	MASTER: "https://www.discogs.com/master/",
	RELEASE: "https://www.discogs.com/release/",
} as const;

export const SWIPER_CONFIG = {
	SLIDES_PER_VIEW: 5,
	ROTATE: 30,
	STRETCH: 10,
	DEPTH: 100,
	MODIFIER: 1,
	SCALE: 1,
} as const;
