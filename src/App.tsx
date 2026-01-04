import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCollection } from "@/api/queries/useCollection";
import { type ViewMode, ViewModes } from "@/api/types";
import { CollectionCoverflow } from "@/components/CollectionCoverflow";
import { db } from "@/db";
import { type CollectionItem, filterAndSortReleases } from "@/lib/utils";
import { CollectionTable } from "./components/CollectionTable";
import { ModeToggle } from "./components/ModeToggle";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";

const STORAGE_KEY = "discogs-username";

function App() {
	const [username, setUsername] = useState("");
	const [shouldFetch, setShouldFetch] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("Coverflow");

	const { data, error } = useCollection(shouldFetch ? username : "", 0);

	// Initialize Dexie database and load username from localStorage on mount
	useEffect(() => {
		db.open().catch((err) => {
			console.error("Failed to open database:", err);
		});

		// Load username from localStorage
		const savedUsername = localStorage.getItem(STORAGE_KEY);
		if (savedUsername) {
			setUsername(savedUsername);
			setShouldFetch(true);
		}
	}, []);

	// Save username to localStorage whenever it changes
	useEffect(() => {
		if (username) {
			localStorage.setItem(STORAGE_KEY, username);
		}
	}, [username]);

	useEffect(() => {
		if (error) toast.error("Failed to load collection.");
	}, [error]);

	const fetchCollection = () => {
		if (!username) return;
		setShouldFetch(true);
	};

	const collection = useMemo<CollectionItem[] | undefined>(
		() => filterAndSortReleases(data?.releases ?? [], selectedFormat),
		[data, selectedFormat],
	);

	const formatFrequencies = useMemo<Record<string, number>>(() => {
		return (
			data?.releases?.reduce(
				(acc, release) => {
					new Set(
						release.basic_information.formats.map((x) => x.name),
					)?.forEach((format) => {
						if (format !== "All Media") acc[format] = (acc[format] || 0) + 1;
					});
					return acc;
				},
				{} as Record<string, number>,
			) ?? {}
		);
	}, [data]);

	return (
		<div className="h-screen flex flex-col">
			<div className="flex gap-2 items-center justify-between p-4">
				<div className="flex gap-2 items-center">
					<Input
						type="text"
						name="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") fetchCollection();
						}}
						id="username"
						autoComplete="username"
						placeholder="Discogs Username"
					/>
					<Button type="button" onClick={fetchCollection}>
						Load Collection
					</Button>
				</div>
				<RadioGroup
					className="flex"
					onValueChange={(e) => setViewMode(e as ViewMode)}
					value={viewMode}
				>
					{ViewModes.map((mode) => (
						<div key={mode} className="flex items-center gap-2">
							<RadioGroupItem value={mode} id={mode}></RadioGroupItem>
							<Label htmlFor={mode}>{mode}</Label>
						</div>
					))}
				</RadioGroup>
				<RadioGroup
					className="flex"
					onValueChange={(e) => setSelectedFormat(e)}
					value={selectedFormat}
				>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="all" id="all"></RadioGroupItem>
						<Label htmlFor="all">All ({data?.releases?.length ?? 0})</Label>
					</div>
					{Object.entries(formatFrequencies).map(([formatName, count]) => (
						<div key={formatName} className="flex items-center gap-2">
							<RadioGroupItem
								value={formatName}
								id={formatName}
							></RadioGroupItem>
							<Label htmlFor={formatName}>
								{formatName} ({count})
							</Label>
						</div>
					))}
				</RadioGroup>
				<ModeToggle />
			</div>
			{viewMode === "Table" ? (
				<div className="p-4 min-h-0 flex-1 overflow-hidden">
					<CollectionTable className="h-full" collection={collection} />
				</div>
			) : (
				<CollectionCoverflow
					className="w-full flex-1"
					collection={collection}
				/>
			)}
		</div>
	);
}

export default App;
