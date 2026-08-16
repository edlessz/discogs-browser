import { Heart, Music } from "lucide-react";
import { useEffect, useState } from "react";
import type { NowPlayingTrack } from "@/api/lastfm/types";
import { cn } from "@/lib/utils";

const formatRelativeTime = (playedAt: number, now: number): string => {
	const seconds = Math.max(0, Math.floor(now / 1000 - playedAt));
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hr ago`;
	const days = Math.floor(hours / 24);
	return days === 1 ? "yesterday" : `${days} days ago`;
};

/** Re-renders every 30s so relative timestamps stay fresh between polls. */
const useNow = (): number => {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 30_000);
		return () => clearInterval(id);
	}, []);
	return now;
};

interface NowPlayingProps {
	track: NowPlayingTrack | null | undefined;
	isLoading: boolean;
	isError: boolean;
	className?: string;
}

export function NowPlaying({
	track,
	isLoading,
	isError,
	className,
}: NowPlayingProps) {
	const now = useNow();
	const [artIndex, setArtIndex] = useState(0);

	// Restart the artwork fallback chain when the track changes
	// (render-time state adjustment, no effect needed)
	const trackKey = track ? `${track.artist}—${track.track}` : "";
	const [prevTrackKey, setPrevTrackKey] = useState(trackKey);
	if (prevTrackKey !== trackKey) {
		setPrevTrackKey(trackKey);
		setArtIndex(0);
	}

	const artSrc =
		track && artIndex < track.artworkCandidates.length
			? track.artworkCandidates[artIndex]
			: undefined;

	if (isLoading) {
		return (
			<div
				className={cn(
					"h-full flex flex-col items-center justify-center gap-8 p-6",
					className,
				)}
			>
				<div className="size-[min(50dvh,75vw)] rounded-2xl bg-muted animate-pulse" />
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-64 max-w-[80vw] rounded bg-muted animate-pulse" />
					<div className="h-6 w-40 max-w-[60vw] rounded bg-muted animate-pulse" />
				</div>
			</div>
		);
	}

	if (!track) {
		return (
			<div
				className={cn(
					"h-full flex flex-col items-center justify-center gap-4 p-6 text-center",
					className,
				)}
			>
				<Music className="size-12 text-muted-foreground" />
				<p className="text-xl text-muted-foreground">
					{isError
						? "Can't reach Last.fm — retrying…"
						: "Nothing scrobbled yet"}
				</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"h-full flex flex-col items-center justify-center gap-6 p-6 text-center select-none",
				className,
			)}
		>
			{/* Album art */}
			<div className="size-[min(50dvh,75vw)] shrink-0">
				{artSrc ? (
					<img
						key={artSrc}
						src={artSrc}
						alt={track.album ? `${track.album} artwork` : "Artwork"}
						onError={() => setArtIndex((i) => i + 1)}
						className="size-full rounded-2xl object-cover shadow-2xl animate-in fade-in duration-500"
					/>
				) : (
					<div className="size-full rounded-2xl bg-muted flex items-center justify-center shadow-2xl">
						<Music className="size-1/3 text-muted-foreground" />
					</div>
				)}
			</div>

			{/* Status */}
			<div className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
				{track.isNowPlaying ? (
					<>
						<span className="relative flex size-2.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
						</span>
						<span className="text-emerald-500">Now playing</span>
					</>
				) : (
					<span className="text-muted-foreground">
						Last played
						{track.playedAt
							? ` · ${formatRelativeTime(track.playedAt, now)}`
							: ""}
					</span>
				)}
				{track.loved && (
					<Heart
						className="size-4 fill-red-500 text-red-500"
						aria-label="Loved track"
					/>
				)}
				{isError && (
					<span className="text-muted-foreground">· connection issues</span>
				)}
			</div>

			{/* Track info */}
			<div className="flex flex-col items-center gap-1 max-w-[90vw]">
				<h1 className="text-3xl md:text-4xl font-bold leading-tight line-clamp-2">
					{track.track}
				</h1>
				<p className="text-xl md:text-2xl text-muted-foreground line-clamp-1">
					{track.artist}
				</p>
				{track.album && (
					<p className="text-sm md:text-base text-muted-foreground/80 line-clamp-1">
						{track.album}
					</p>
				)}
			</div>
		</div>
	);
}
