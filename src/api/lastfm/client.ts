import axios from "axios";

export const LASTFM_API_BASE = "https://ws.audioscrobbler.com/2.0/";

const lastfmClient = axios.create({
	baseURL: LASTFM_API_BASE,
	params: {
		format: "json",
	},
});

export default lastfmClient;
