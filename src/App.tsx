import { AudioLines, Disc3, Image, ImageOff } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useCollection } from "@/api/queries/useCollection";
import { useNowPlaying } from "@/api/queries/useNowPlaying";
import { ModeToggle } from "@/components/ModeToggle";
import { NowPlaying } from "@/components/NowPlaying";
import { Button } from "@/components/ui/button";
import { config, missingConfigKeys } from "@/config";

// Lazy-loaded: keeps Swiper/TanStack Table out of the kiosk home view
const CollectionBrowser = lazy(() =>
	import("@/components/CollectionBrowser").then((m) => ({
		default: m.CollectionBrowser,
	})),
);

type View = "now-playing" | "collection";

const BACKDROP_STORAGE_KEY = "now-playing-backdrop";

const readBackdropPreference = (): boolean => {
	try {
		return localStorage.getItem(BACKDROP_STORAGE_KEY) !== "off";
	} catch {
		return true;
	}
};

function MissingConfig({ missing }: { missing: string[] }) {
	return (
		<div className="h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="text-2xl font-bold">Configuration needed</h1>
			<p className="text-muted-foreground max-w-md">
				Create a <code className="text-foreground">.env.local</code> file in the
				project root (see <code className="text-foreground">.env.example</code>)
				with:
			</p>
			<ul className="text-left font-mono text-sm">
				{missing.map((key) => (
					<li key={key}>{key}=…</li>
				))}
			</ul>
			<p className="text-muted-foreground">
				Then restart the dev server or rebuild.
			</p>
		</div>
	);
}

function App() {
	const [view, setView] = useState<View>("now-playing");
	const [showBackdrop, setShowBackdrop] = useState(readBackdropPreference);
	// Survives view switches so the collection reopens where you left it
	const [collectionIndex, setCollectionIndex] = useState(0);
	const missing = missingConfigKeys();
	const { data, isLoading, isError } = useNowPlaying(missing.length === 0);

	// Eager: start the (slow, auto-paginating) collection fetch on page load.
	// Same query key as the collection view -> one fetch, shared cache.
	useCollection(config.discogsUsername, 0);

	useEffect(() => {
		try {
			localStorage.setItem(BACKDROP_STORAGE_KEY, showBackdrop ? "on" : "off");
		} catch {
			// Non-critical - preference just won't persist
		}
	}, [showBackdrop]);

	if (missing.length > 0) {
		return <MissingConfig missing={missing} />;
	}

	return (
		<div className="h-screen flex flex-col">
			<div className="flex-1 min-h-0">
				{view === "now-playing" ? (
					<NowPlaying
						track={data}
						isLoading={isLoading}
						isError={isError}
						showBackdrop={showBackdrop}
					/>
				) : (
					<Suspense fallback={null}>
						<CollectionBrowser
							initialIndex={collectionIndex}
							onIndexChange={setCollectionIndex}
						/>
					</Suspense>
				)}
			</div>
			<div className="fixed bottom-4 right-4 flex gap-1 rounded-full border bg-background/80 p-1 shadow-lg backdrop-blur">
				{view === "now-playing" && (
					<Button
						variant="ghost"
						size="icon"
						aria-label={
							showBackdrop
								? "Hide artwork background"
								: "Show artwork background"
						}
						onClick={() => setShowBackdrop((v) => !v)}
					>
						{showBackdrop ? (
							<ImageOff className="h-5 w-5" />
						) : (
							<Image className="h-5 w-5" />
						)}
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon"
					aria-label={
						view === "now-playing"
							? "Show Discogs collection"
							: "Show now playing"
					}
					onClick={() =>
						setView(view === "now-playing" ? "collection" : "now-playing")
					}
				>
					{view === "now-playing" ? (
						<Disc3 className="h-5 w-5" />
					) : (
						<AudioLines className="h-5 w-5" />
					)}
				</Button>
				<ModeToggle />
			</div>
		</div>
	);
}

export default App;
