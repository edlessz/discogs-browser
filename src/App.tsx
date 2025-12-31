import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCollection } from "@/api/queries/useCollection";
import type { ViewMode } from "@/api/types";
import { Coverflow } from "@/components/Coverflow";
import { ReleasesTable } from "@/components/ReleasesTable";
import { TopBar } from "@/components/TopBar";

function App() {
	const [username, setUsername] = useState("");
	const [shouldFetch, setShouldFetch] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("coverflow");

	const { data: collection, error } = useCollection(
		shouldFetch ? username : "",
		0,
	);

	useEffect(() => {
		if (error) {
			toast.error("Failed to load collection.");
		}
	}, [error]);

	const fetchCollection = () => {
		if (!username) return;
		setShouldFetch(true);
	};

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
			<div className="flex-1 overflow-auto">
				{viewMode === "table" ? (
					<div className="p-4 h-full">
						<ReleasesTable
							className="w-full"
							collection={collection}
							selectedFormat={selectedFormat}
						/>
					</div>
				) : (
					<Coverflow
						className="w-full"
						collection={collection}
						selectedFormat={selectedFormat}
					/>
				)}
			</div>
		</div>
	);
}

export default App;
