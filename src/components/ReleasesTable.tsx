import type { CollectionItemsResponse, ReleaseInstance } from "../api/types";
import type { MasterRelease } from "../api/types/database";
import { DISCOGS_URLS } from "../constants/api";
import { filterAndSortReleases, getReleaseYear } from "../utils";
import { Table } from "./Table";

interface ReleasesTableProps {
	collection: CollectionItemsResponse | null;
	selectedFormat: string;
	masterReleases: Record<number, MasterRelease>;
	className?: string;
}

export function ReleasesTable({
	collection,
	selectedFormat,
	masterReleases,
	className = "",
}: ReleasesTableProps) {
	if (!collection) return null;

	const filteredAndSortedReleases = filterAndSortReleases(
		collection.releases ?? [],
		selectedFormat,
		masterReleases,
	);

	return (
		<div className="overflow-auto h-full">
			<Table<ReleaseInstance>
				className={`overflow-auto ${className}`}
				data={filteredAndSortedReleases}
				columns={[
					{
						key: true,
						field: "instance_id",
						header: "Instance ID",
						hidden: true,
					},
					{
						field: "basic_information.master_id",
						header: "ID",
						renderer: (row) => {
							const id =
								row.basic_information.master_id !== 0
									? row.basic_information.master_id
									: row.basic_information.id;
							const url =
								row.basic_information.master_id !== 0
									? `${DISCOGS_URLS.MASTER}${row.basic_information.master_id}`
									: `${DISCOGS_URLS.RELEASE}${row.basic_information.id}`;

							return (
								<a href={url} target="_blank" rel="noopener noreferrer">
									{id}
								</a>
							);
						},
					},
					{
						field: "basic_information.artist",
						header: "Artist",
						renderer: (row) =>
							row.basic_information.artists.map((x) => x.name).join(", "),
					},
					{
						header: "Year",
						renderer: (row) => {
							const year = getReleaseYear(row, masterReleases);
							return year === 0 ? "Unknown" : year;
						},
					},
					{
						field: "basic_information.title",
						header: "Title",
					},
				]}
			/>
		</div>
	);
}
