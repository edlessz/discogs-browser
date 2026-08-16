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
	/** Show the artwork as a full-screen ambient backdrop */
	showBackdrop?: boolean;
	className?: string;
}

export function NowPlaying({
	track,
	isLoading,
	isError,
	showBackdrop = true,
	className,
}: NowPlayingProps) {
	const now = useNow();
	const [artIndex, setArtIndex] = useState(0);
	const [loadedArt, setLoadedArt] = useState<string | null>(null);
	const [instantFailed, setInstantFailed] = useState(false);

	// Restart the artwork chain when the track changes
	// (render-time state adjustment, no effect needed)
	const trackKey = track ? `${track.artist}—${track.track}` : "";
	const [prevTrackKey, setPrevTrackKey] = useState(trackKey);
	if (prevTrackKey !== trackKey) {
		setPrevTrackKey(trackKey);
		setArtIndex(0);
		setLoadedArt(null);
		setInstantFailed(false);
	}

	// Hi-res candidate currently being attempted (walks on error)
	const artSrc =
		track && artIndex < track.artworkCandidates.length
			? track.artworkCandidates[artIndex]
			: undefined;
	// Fast Last.fm image shown instantly underneath while hi-res loads
	const instantSrc =
		!instantFailed && track?.instantArtUrl ? track.instantArtUrl : undefined;
	// Whatever is actually on screen right now (drives the backdrop too)
	const displayedArt = loadedArt ?? instantSrc;

	if (isLoading) {
		return (
			<div
				className={cn(
					"h-full flex flex-col landscape:flex-row items-center justify-center gap-8 landscape:gap-12 p-6",
					className,
				)}
			>
				<div className="size-[min(45dvh,75vw)] landscape:size-[min(70dvh,45vw)] rounded-2xl bg-muted animate-pulse" />
				<div className="flex flex-col items-center landscape:items-start gap-3">
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
		<div className={cn("relative h-full overflow-hidden", className)}>
			{/* Ambient backdrop: the displayed artwork, upscaled by the browser (no
			    CSS blur filter — too heavy for weak kiosk GPUs) + a theme-aware
			    scrim for text legibility. Follows the instant -> hi-res upgrade. */}
			{showBackdrop && displayedArt && (
				<div className="absolute inset-0" aria-hidden>
					<img
						key={`backdrop-${displayedArt}`}
						src={displayedArt}
						alt=""
						className="size-full object-cover scale-110 animate-in fade-in duration-700"
					/>
					<div className="absolute inset-0 bg-background/80" />
				</div>
			)}

			{/* Side-by-side on landscape kiosk screens (1280x800), stacked in portrait */}
			<div className="relative h-full flex flex-col landscape:flex-row items-center justify-center gap-6 landscape:gap-12 p-6 text-center landscape:text-left select-none">
				{/* Album art: stacked layers — placeholder, instant Last.fm image,
				    then the hi-res candidate fading in once fully loaded */}
				<div className="relative size-[min(45dvh,75vw)] landscape:size-[min(70dvh,45vw)] shrink-0 rounded-2xl shadow-2xl">
					<div className="absolute inset-0 rounded-2xl bg-muted flex items-center justify-center">
						<Music className="size-1/3 text-muted-foreground" />
					</div>
					{instantSrc && (
						<img
							src={instantSrc}
							alt=""
							aria-hidden
							onError={() => setInstantFailed(true)}
							className="absolute inset-0 size-full rounded-2xl object-cover"
						/>
					)}
					{artSrc && (
						<img
							key={artSrc}
							src={artSrc}
							alt={track.album ? `${track.album} artwork` : "Artwork"}
							onLoad={() => setLoadedArt(artSrc)}
							onError={() => setArtIndex((i) => i + 1)}
							className={cn(
								"absolute inset-0 size-full rounded-2xl object-cover transition-opacity duration-700",
								loadedArt === artSrc ? "opacity-100" : "opacity-0",
							)}
						/>
					)}
				</div>

				<div className="flex flex-col items-center landscape:items-start gap-4 landscape:gap-5 min-w-0 max-w-[90vw] landscape:max-w-xl">
					{/* Status */}
					<div className="flex items-center gap-2 text-sm landscape:text-base font-medium tracking-wide uppercase">
						{track.isNowPlaying ? (
							<>
								<span className="relative flex size-2.5 landscape:size-3">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
									<span className="relative inline-flex rounded-full size-2.5 landscape:size-3 bg-emerald-500" />
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
								className="size-4 landscape:size-5 fill-red-500 text-red-500"
								aria-label="Loved track"
							/>
						)}
						{isError && (
							<span className="text-muted-foreground">· connection issues</span>
						)}
					</div>

					{/* Track info */}
					<div className="flex flex-col items-center landscape:items-start gap-1 landscape:gap-2 min-w-0">
						<h1 className="text-3xl landscape:text-5xl font-bold leading-tight line-clamp-2">
							{track.track}
						</h1>
						<p className="text-xl landscape:text-3xl text-muted-foreground line-clamp-1">
							{track.artist}
						</p>
						{track.album && (
							<p className="text-sm landscape:text-lg text-muted-foreground/80 line-clamp-1">
								{track.album}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
