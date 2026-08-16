import { useQuery } from "@tanstack/react-query";
import { getNowPlaying } from "../lastfm";
import type { NowPlayingTrack } from "../lastfm/types";

export const NOW_PLAYING_REFETCH_INTERVAL = 15_000;

export function useNowPlaying(enabled: boolean) {
	return useQuery<NowPlayingTrack | null>({
		queryKey: ["lastfm", "now-playing"],
		queryFn: getNowPlaying,
		enabled,
		refetchInterval: NOW_PLAYING_REFETCH_INTERVAL,
		refetchIntervalInBackground: true,
	});
}
