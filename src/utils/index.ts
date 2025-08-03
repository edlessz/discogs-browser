import type { ReleaseInstance } from "../api/types";
import type { MasterRelease } from "../api/types/database";

export const normalizeArtistName = (name: string): string => {
	return name.replace(/^(The|A|An)\s+/i, "").trim();
};

export const getArtistNames = (release: ReleaseInstance): string => {
	return release.basic_information.artists.map((x) => x.name).join(", ");
};

export const getReleaseYear = (
	release: ReleaseInstance,
	masterReleases: Record<number, MasterRelease>,
): number => {
	return (
		masterReleases[release.basic_information.master_id]?.year ??
		release.basic_information.year ??
		0
	);
};

export const filterAndSortReleases = (
	releases: ReleaseInstance[],
	selectedFormat: string,
	masterReleases: Record<number, MasterRelease>,
): ReleaseInstance[] => {
	return releases
		.filter(
			(release) =>
				selectedFormat === "all" ||
				release.basic_information.formats?.some(
					(format) => format.name === selectedFormat,
				),
		)
		.sort((a, b) => {
			const artistA = normalizeArtistName(getArtistNames(a));
			const artistB = normalizeArtistName(getArtistNames(b));

			const yearA = getReleaseYear(a, masterReleases);
			const yearB = getReleaseYear(b, masterReleases);

			const artistComparison = artistA.localeCompare(artistB);
			if (artistComparison !== 0) {
				return artistComparison;
			}

			return yearA - yearB;
		});
};

export const getFormats = (release: ReleaseInstance): string => {
	return [
		...new Set(
			release.basic_information.formats?.map((format) => format.name) ?? [],
		),
	]
		.filter((x) => x !== "All Media")
		.join(", ");
};
