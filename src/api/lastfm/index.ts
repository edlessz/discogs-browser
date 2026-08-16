import { config } from "@/config";
import { buildArtworkCandidates } from "../artwork";
import client from "./client";
import type {
	LastfmRecentTrack,
	NowPlayingTrack,
	RecentTracksResponse,
} from "./types";

const normalize = async (
	track: LastfmRecentTrack,
): Promise<NowPlayingTrack> => ({
	track: track.name,
	artist: track.artist.name,
	album: track.album["#text"],
	albumMbid: track.album.mbid,
	artworkCandidates: await buildArtworkCandidates({
		albumMbid: track.album.mbid,
		trackImages: track.image,
		artistImages: track.artist.image,
	}),
	isNowPlaying: track["@attr"]?.nowplaying === "true",
	loved: track.loved === "1",
	playedAt: track.date ? Number.parseInt(track.date.uts, 10) : undefined,
	url: track.url,
});

/**
 * Fetches the user's most recent track. The first entry is the currently
 * scrobbling track (`isNowPlaying`) when one is active, otherwise the most
 * recently scrobbled track.
 */
export const getNowPlaying = async (): Promise<NowPlayingTrack | null> => {
	const res = await client.get<RecentTracksResponse>("", {
		params: {
			method: "user.getrecenttracks",
			user: config.lastfmUser,
			api_key: config.lastfmApiKey,
			limit: 1,
			extended: 1,
		},
	});
	const track = res.data.recenttracks.track[0];
	return track ? normalize(track) : null;
};
