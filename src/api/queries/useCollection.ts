import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { masterReleaseService } from "@/db";
import type { CollectionItem } from "@/lib/utils";
import { getCollectionItemsByFolder } from "../discogs";
import type { CollectionItemsResponse } from "../types";

export function useCollection(username: string, folderId = 0) {
	const [enrichedReleases, setEnrichedReleases] = useState<CollectionItem[]>(
		[],
	);

	const query = useQuery<CollectionItemsResponse>({
		queryKey: ["collection", username, folderId],
		queryFn: async () => {
			return await getCollectionItemsByFolder(username, folderId);
		},
		enabled: !!username,
	});

	// Load cached master release data on mount or when collection changes
	useEffect(() => {
		if (!query.data?.releases) {
			setEnrichedReleases([]);
			return;
		}

		const loadCachedData = async () => {
			const releases = query.data.releases;

			// Extract all master_ids
			const masterIds = releases
				.map((r) => r.basic_information.master_id)
				.filter((id) => id > 0); // Filter out items without master_id

			// Bulk load from IndexedDB
			const cachedMasters = await masterReleaseService.getMany(masterIds);

			// Enrich releases with cached master years
			const enriched: CollectionItem[] = releases.map((release) => {
				const masterId = release.basic_information.master_id;
				const cached = cachedMasters.get(masterId);

				return {
					...release,
					master_release_year: cached?.year,
				};
			});

			setEnrichedReleases(enriched);
		};

		loadCachedData();
	}, [query.data]);

	return {
		...query,
		data: query.data
			? {
					...query.data,
					releases: enrichedReleases,
				}
			: undefined,
	};
}
