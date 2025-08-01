import { useEffect, useState } from "react";
import { getCollectionItemsByFolder, getMasterRelease } from "./api/discogs";
import "./App.css";
import type { CollectionItemsResponse } from "./api/types";
import type { MasterRelease } from "./api/types/database";
import { TopBar } from "./components/TopBar/TopBar";
import { ReleasesTable } from "./components/ReleasesTable/ReleasesTable";
import {
	cacheMasterRelease,
	getAllCachedMasterReleases,
	getCachedMasterRelease,
} from "./db/masterReleasesDB";

function App() {
	const [username, setUsername] = useState("");

	const [collection, setCollection] = useState<CollectionItemsResponse | null>(
		null,
	);
	const [selectedFormat, setSelectedFormat] = useState<string>("all");
	const fetchCollection = async () => {
		if (!username) return;
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

			const cached = await getCachedMasterRelease(masterId);
			if (cached) {
				setMasterReleases((prev) => ({ ...prev, [masterId]: cached }));
				continue;
			}

			const masterRelease = await getMasterRelease(masterId);
			setMasterReleases((prev) => ({ ...prev, [masterId]: masterRelease }));
			cacheMasterRelease(masterRelease);
		}
	};

	const [masterReleases, setMasterReleases] = useState<
		Record<number, MasterRelease>
	>({});
	useEffect(() => {
		getAllCachedMasterReleases().then(setMasterReleases);
	}, []);

	return (
		<div className="h-full flex flex-col gap-2">
			<TopBar
				username={username}
				setUsername={setUsername}
				selectedFormat={selectedFormat}
				setSelectedFormat={setSelectedFormat}
				collection={collection}
				onLoadCollection={fetchCollection}
			/>
			<div className="overflow-auto flex-1">
				<ReleasesTable
					className="w-full"
					collection={collection}
					selectedFormat={selectedFormat}
					masterReleases={masterReleases}
				/>
			</div>
		</div>
	);
}

export default App;
