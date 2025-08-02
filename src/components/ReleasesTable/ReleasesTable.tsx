import type { CollectionItemsResponse, ReleaseInstance } from "../../api/types";
import type { MasterRelease } from "../../api/types/database";
import { Table } from "../Table/Table";

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

	const normalizeArtistName = (name: string) => {
		return name.replace(/^(The|A|An)\s+/i, "").trim();
	};

	const filteredAndSortedReleases = (collection.releases ?? [])
		.filter(
			(release) =>
				selectedFormat === "all" ||
				release.basic_information.formats?.some(
					(format) => format.name === selectedFormat,
				),
		)
		.sort((a, b) => {
			const artistA = normalizeArtistName(
				a.basic_information.artists.map((x) => x.name).join(", "),
			);
			const artistB = normalizeArtistName(
				b.basic_information.artists.map((x) => x.name).join(", "),
			);

			const yearA =
				masterReleases[a.basic_information.master_id]?.year ??
				a.basic_information.year ??
				0;
			const yearB =
				masterReleases[b.basic_information.master_id]?.year ??
				b.basic_information.year ??
				0;

			const artistComparison = artistA.localeCompare(artistB);
			if (artistComparison !== 0) {
				return artistComparison;
			}

			return yearA - yearB;
		});

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
									? `https://www.discogs.com/master/${row.basic_information.master_id}`
									: `https://www.discogs.com/release/${row.basic_information.id}`;

							return (
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
								>
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
						renderer: (row) =>
							masterReleases[row.basic_information.master_id]?.year ??
							row.basic_information.year ??
							"Unknown",
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
