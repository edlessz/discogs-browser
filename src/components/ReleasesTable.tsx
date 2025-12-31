import { DISCOGS_URLS } from "@/api/constants";
import type { CollectionItemsResponse, ReleaseInstance } from "@/api/types";
import { Table } from "@/components/Table";
import { filterAndSortReleases } from "@/lib/utils";

interface ReleasesTableProps {
	collection: CollectionItemsResponse | null | undefined;
	selectedFormat: string;
	className?: string;
}

export function ReleasesTable({
	collection,
	selectedFormat,
	className = "",
}: ReleasesTableProps) {
	if (!collection) return null;

	const filteredAndSortedReleases = filterAndSortReleases(
		collection.releases ?? [],
		selectedFormat,
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
							const year = row.basic_information.year;
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
