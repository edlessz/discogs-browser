import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCollection } from "@/api/queries/useCollection";
import type { ViewMode } from "@/api/types";
import { CollectionCoverflow } from "@/components/CollectionCoverflow";
import { TopBar } from "@/components/TopBar";
import { type CollectionItem, filterAndSortReleases } from "@/lib/utils";
import { CollectionTable } from "./components/CollectionTable";

function App() {
	const [username, setUsername] = useState("");
	const [shouldFetch, setShouldFetch] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("coverflow");

	const { data, error } = useCollection(shouldFetch ? username : "", 0);

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

	return (
		<div className="h-screen flex flex-col">
			<TopBar
				username={username}
				setUsername={setUsername}
				selectedFormat={selectedFormat}
				setSelectedFormat={setSelectedFormat}
				collection={collection}
				onLoadCollection={fetchCollection}
				viewMode={viewMode}
				setViewMode={setViewMode}
			/>
			{viewMode === "table" ? (
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
