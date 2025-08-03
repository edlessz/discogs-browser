import { useEffect, useState } from "react";
import { getCollectionItemsByFolder, getMasterRelease } from "./api/discogs";
import type { CollectionItemsResponse } from "./api/types";
import type { MasterRelease } from "./api/types/database";
import { Coverflow } from "./components/Coverflow/Coverflow";
import { ReleasesTable } from "./components/ReleasesTable/ReleasesTable";
import { ToastProvider, useToast } from "./components/Toast/ToastProvider";
import { TopBar } from "./components/TopBar/TopBar";
import {
	cacheMasterRelease,
	getAllCachedMasterReleases,
	getCachedMasterRelease,
	clearCachedMasterReleases,
} from "./db/masterReleasesDB";

type ViewMode = "table" | "coverflow";

function AppContent() {
	const [username, setUsername] = useState("");
	const { showError } = useToast();

	const [collection, setCollection] = useState<CollectionItemsResponse | null>(
		null,
	);
	const [selectedFormat, setSelectedFormat] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("coverflow");
	const fetchCollection = async () => {
		if (!username) return;

		try {
			const data = await getCollectionItemsByFolder(username, 0);
			setCollection(data);

			const masterIds = [
				...new Set(
					(data.releases ?? []).map(
						(release) => release.basic_information.master_id,
					),
				),
			];

			for (const masterId of masterIds) {
				if (!masterId || masterReleases[masterId]) continue;

				try {
					const cached = await getCachedMasterRelease(masterId);
					if (cached) {
						setMasterReleases((prev) => ({ ...prev, [masterId]: cached }));
						continue;
					}

					const masterRelease = await getMasterRelease(masterId);
					setMasterReleases((prev) => ({ ...prev, [masterId]: masterRelease }));
					cacheMasterRelease(masterRelease);
				} catch (error) {
					console.error(`Failed to fetch master release ${masterId}:`, error);
				}
			}
		} catch (error) {
			console.error("Failed to fetch collection:", error);
			showError(
				"Failed to load collection. Please check the username and try again.",
			);
		}
	};

	const [masterReleases, setMasterReleases] = useState<
		Record<number, MasterRelease>
	>({});
	useEffect(() => {
		const checkClearParam = async () => {
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has('clear')) {
				try {
					await clearCachedMasterReleases();
					console.log('IndexedDB cache cleared');
					// Remove the clear parameter from URL to avoid clearing on refresh
					urlParams.delete('clear');
					const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
					window.history.replaceState({}, '', newUrl);
				} catch (error) {
					console.error('Failed to clear IndexedDB cache:', error);
				}
			}
		};

		const loadCachedData = async () => {
			await checkClearParam();
			const cachedReleases = await getAllCachedMasterReleases();
			setMasterReleases(cachedReleases);
		};

		loadCachedData();
	}, []);

	return (
		<div className="h-full flex flex-col">
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
							masterReleases={masterReleases}
						/>
					</div>
				) : (
					<Coverflow
						className="w-full"
						collection={collection}
						selectedFormat={selectedFormat}
						masterReleases={masterReleases}
					/>
				)}
			</div>
		</div>
	);
}

function App() {
	return (
		<ToastProvider>
			<AppContent />
		</ToastProvider>
	);
}

export default App;
