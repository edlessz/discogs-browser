import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReleaseInstance } from "@/api/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const normalizeArtistName = (name: string): string => {
	return name.replace(/^(The|A|An)\s+/i, "").trim();
};

export const getArtistNames = (release: CollectionItem): string => {
	return release.basic_information.artists.map((x) => x.name).join(", ");
};

export const filterAndSortReleases = (
	releases: CollectionItem[],
	selectedFormat: string,
): CollectionItem[] => {
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

			const yearA = a.basic_information.year;
			const yearB = b.basic_information.year;

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

export type CollectionItem = ReleaseInstance;
