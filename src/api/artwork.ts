import axios from "axios";
import type { LastfmImage } from "./lastfm/types";

/**
 * High-res artwork sources, tried in order by the UI's <img onError> chain:
 *
 * 1. Cover Art Archive `front-1200` for the exact release MBID Last.fm gives
 *    us — often the actual pressing (e.g. a specific vinyl reissue).
 * 2. CAA `front-1200` for the release-GROUP — one cached MusicBrainz lookup
 *    maps release -> group; the group endpoint always returns the album's
 *    best front cover even when the specific pressing has none.
 * 3. Last.fm CDN upsizes — Last.fm's API caps at 300px, but their image CDN
 *    (Fastly) accepts arbitrary size params, and `/i/u/1200x0/<hash>` returns
 *    the full-resolution original when one exists. No third-party service.
 * 4. Last.fm's documented sizes (extralarge 300px and below), then artist art.
 *
 * Heads-up: CAA's redirects AND images are both served from archive.org
 * infrastructure. On networks where archive.org is blocked/unreachable, those
 * candidates simply fail through to the Last.fm ones — by design.
 *
 * MusicBrainz note: browsers can't set User-Agent, which MB acknowledges for
 * client-side apps; at one lookup per track change we're far under the
 * 1 req/sec limit. CORS is open (`Access-Control-Allow-Origin: *`) on MB, CAA,
 * and the Last.fm CDN.
 */

const MB_API_BASE = "https://musicbrainz.org/ws/2";
const CAA_BASE = "https://coverartarchive.org";

const IMAGE_SIZE_PRIORITY = ["extralarge", "large", "medium", "small"];
const LASTFM_UPSIZES = ["1200x0", "600x0"];

export const caaReleaseFront = (releaseMbid: string): string =>
	`${CAA_BASE}/release/${releaseMbid}/front-1200`;

export const caaReleaseGroupFront = (releaseGroupMbid: string): string =>
	`${CAA_BASE}/release-group/${releaseGroupMbid}/front-1200`;

const releaseGroupCache = new Map<string, string | null>();

interface MbReleaseResponse {
	"release-group"?: { id?: string };
}

/**
 * Release MBID -> release-group MBID, cached for the session. Only successful
 * responses are cached: transient MB errors (503 "busy", rate limits) retry
 * naturally on the next poll instead of being stuck for the session.
 */
export const getReleaseGroupMbid = async (
	releaseMbid: string,
): Promise<string | null> => {
	const cached = releaseGroupCache.get(releaseMbid);
	if (cached !== undefined) return cached;

	try {
		const res = await axios.get<MbReleaseResponse>(
			`${MB_API_BASE}/release/${releaseMbid}`,
			{ params: { fmt: "json" } },
		);
		const groupMbid = res.data["release-group"]?.id ?? null;
		releaseGroupCache.set(releaseMbid, groupMbid);
		return groupMbid;
	} catch {
		return null;
	}
};

/** Rewrites a Last.fm CDN URL to a larger size param, if it matches the pattern. */
const upsizeLastfmUrl = (url: string, size: string): string | null => {
	const upsized = url.replace(/\/i\/u\/[^/]+\//, `/i/u/${size}/`);
	return upsized !== url ? upsized : null;
};

/**
 * Last.fm art chain: the best image the API reports, upsized to the CDN's
 * max first, then remaining documented sizes descending.
 */
const lastfmImageChain = (images: LastfmImage[] | undefined): string[] => {
	const urls: string[] = [];
	const best = IMAGE_SIZE_PRIORITY.map(
		(size) => images?.find((img) => img.size === size)?.["#text"],
	).find((url) => !!url);

	if (best) {
		for (const size of LASTFM_UPSIZES) {
			const upsized = upsizeLastfmUrl(best, size);
			if (upsized) urls.push(upsized);
		}
		urls.push(best);
	}

	for (const size of IMAGE_SIZE_PRIORITY) {
		const url = images?.find((img) => img.size === size)?.["#text"];
		if (url && url !== best) urls.push(url);
	}
	return urls;
};

interface ArtworkSource {
	albumMbid: string;
	trackImages?: LastfmImage[];
	artistImages?: LastfmImage[];
}

/**
 * Ordered artwork URLs, highest resolution first. The UI walks the list on
 * load errors, so unreachable/404 entries degrade gracefully to Last.fm art.
 */
export const buildArtworkCandidates = async (
	source: ArtworkSource,
): Promise<string[]> => {
	const candidates: string[] = [];

	if (source.albumMbid) {
		candidates.push(caaReleaseFront(source.albumMbid));
		const groupMbid = await getReleaseGroupMbid(source.albumMbid);
		if (groupMbid) candidates.push(caaReleaseGroupFront(groupMbid));
	}

	candidates.push(...lastfmImageChain(source.trackImages));
	// Last resort: artist image (present with extended=1)
	candidates.push(...lastfmImageChain(source.artistImages));

	// Deduplicate while preserving order
	return [...new Set(candidates)];
};
