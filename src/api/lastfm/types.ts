/**
 * Last.fm REST API response shapes (format=json).
 *
 * `user.getRecentTracks` is called with extended=1, which changes some
 * fields from `{ "#text": string }` to richer objects. Types here reflect
 * the extended shape; normalization lives in `index.ts`.
 */

export interface LastfmImage {
	/** Image URL (may be empty string) */
	"#text": string;
	size: "small" | "medium" | "large" | "extralarge" | "" | string;
}

export interface LastfmArtistExtended {
	name: string;
	mbid: string;
	url: string;
	image: LastfmImage[];
}

export interface LastfmAlbum {
	mbid: string;
	"#text": string;
}

export interface LastfmDate {
	uts: string;
	"#text": string;
}

export interface LastfmRecentTrack {
	artist: LastfmArtistExtended;
	album: LastfmAlbum;
	name: string;
	mbid: string;
	url: string;
	image: LastfmImage[];
	loved?: "0" | "1";
	streamable?: string;
	/** Present only on scrobbled (not now-playing) tracks */
	date?: LastfmDate;
	"@attr"?: {
		nowplaying?: string;
	};
}

export interface RecentTracksResponse {
	recenttracks: {
		track: LastfmRecentTrack[];
		"@attr": {
			user: string;
			totalPages: string;
			page: string;
			perPage: string;
			total: string;
		};
	};
}

/** Normalized shape consumed by the UI. */
export interface NowPlayingTrack {
	track: string;
	artist: string;
	album: string;
	/** MusicBrainz release MBID for the album (may be empty) */
	albumMbid: string;
	/**
	 * Artwork URLs to try in order, highest resolution first
	 * (Cover Art Archive 1200px when a release MBID is known,
	 * then Last.fm's own images descending). May be empty.
	 */
	artworkCandidates: string[];
	/**
	 * Fast-loading Last.fm image to show instantly while the hi-res
	 * candidates load; the hi-res layer fades in over it. Empty if none.
	 */
	instantArtUrl: string;
	isNowPlaying: boolean;
	loved: boolean;
	/** Unix seconds; undefined while the track is still playing */
	playedAt?: number;
	url: string;
}
