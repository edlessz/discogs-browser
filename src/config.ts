interface AppConfig {
	lastfmApiKey: string;
	lastfmUser: string;
}

const readConfig = (): AppConfig => ({
	lastfmApiKey: import.meta.env.VITE_LASTFM_API_KEY ?? "",
	lastfmUser: import.meta.env.VITE_LASTFM_USER ?? "",
});

export const config = readConfig();

export const missingConfigKeys = (): string[] => {
	const missing: string[] = [];
	if (!config.lastfmApiKey) missing.push("VITE_LASTFM_API_KEY");
	if (!config.lastfmUser) missing.push("VITE_LASTFM_USER");
	return missing;
};
