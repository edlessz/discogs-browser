import { AudioLines, Disc3 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useNowPlaying } from "@/api/queries/useNowPlaying";
import { ModeToggle } from "@/components/ModeToggle";
import { NowPlaying } from "@/components/NowPlaying";
import { Button } from "@/components/ui/button";
import { missingConfigKeys } from "@/config";

// Lazy-loaded: keeps Swiper/TanStack Table out of the kiosk home view
const CollectionBrowser = lazy(() =>
	import("@/components/CollectionBrowser").then((m) => ({
		default: m.CollectionBrowser,
	})),
);

type View = "now-playing" | "collection";

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
	const missing = missingConfigKeys();
	const { data, isLoading, isError } = useNowPlaying(missing.length === 0);

	if (missing.length > 0) {
		return <MissingConfig missing={missing} />;
	}

	return (
		<div className="h-screen flex flex-col">
			<div className="flex-1 min-h-0">
				{view === "now-playing" ? (
					<NowPlaying track={data} isLoading={isLoading} isError={isError} />
				) : (
					<Suspense fallback={null}>
						<CollectionBrowser />
					</Suspense>
				)}
			</div>
			<div className="fixed bottom-4 right-4 flex gap-1 rounded-full border bg-background/80 p-1 shadow-lg backdrop-blur">
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
