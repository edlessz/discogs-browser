import { useEffect, useState } from "react";
import {
	getCollectionFolders,
	getCollectionItemsByFolder,
	getMasterRelease,
} from "./api/discogs";
import "./App.css";
import { Button, Input } from "@headlessui/react";
import type {
	CollectionFoldersResponse,
	CollectionItemsResponse,
	ReleaseInstance,
} from "./api/types";
import type { MasterRelease } from "./api/types/database";
import { Table } from "./components/Table/Table";
import {
	cacheMasterRelease,
	getAllCachedMasterReleases,
	getCachedMasterRelease,
} from "./db/masterReleasesDB";

function App() {
	const [username, setUsername] = useState("");

	const [folders, setFolders] = useState<CollectionFoldersResponse | null>(
		null,
	);
	const fetchCollectionFolders = () => {
		getCollectionFolders(username).then(setFolders);
	};

	const [collections, setCollections] = useState<
		Record<number, CollectionItemsResponse>
	>({});
	const fetchCollectionFolder = async (folderId: number) => {
		const data = await getCollectionItemsByFolder(username, folderId);
		setCollections((prev) => ({ ...prev, [folderId]: data }));

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
		<div>
			<div className="flex gap-2">
				<Input
					type="text"
					name="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					id="username"
					autoComplete="username"
					placeholder="Discogs Username"
				/>
				<Button type="button" onClick={fetchCollectionFolders}>
					Get Folders
				</Button>
			</div>

			{folders?.folders && (
				<ul>
					{folders.folders.map((folder) => (
						<li key={folder.id}>
							<Button
								type="button"
								onClick={() => fetchCollectionFolder(folder.id)}
							>
								{folder.name} ({folder.count})
							</Button>

							<Table<ReleaseInstance>
								data={collections[folder.id]?.releases ?? []}
								columns={[
									{
										key: true,
										field: "instance_id",
										header: "Instance ID",
										hidden: true,
									},
									{
										field: "basic_information.master_id",
										header: "Master ID",
										sortable: true,
									},
									{
										field: "basic_information.artist",
										header: "Artist",
										sortable: true,
										renderer: (row) =>
											row.basic_information.artists
												.map((x) => x.name)
												.join(", "),
									},
									{
										header: "Year",
										sortable: true,
										renderer: (row) =>
											masterReleases[row.basic_information.master_id]?.year ??
											row.basic_information.year ??
											"Unknown",
									},
									{
										field: "basic_information.title",
										header: "Title",
										sortable: true,
									},
								]}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default App;
