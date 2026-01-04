import { useMutation, useQueryClient } from "@tanstack/react-query";
import { masterReleaseService } from "@/db";
import { getMasterRelease } from "../discogs";
import type { CollectionItemsResponse, MasterRelease } from "../types";

interface FetchMasterReleaseParams {
	masterId: number;
	instanceId: number; // To update the specific collection item
}

/**
 * Hook to fetch and cache master release data
 * Integrates with IndexedDB and React Query cache
 */
export function useFetchMasterRelease() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			masterId,
		}: FetchMasterReleaseParams): Promise<MasterRelease> => {
			// First check IndexedDB cache
			const cached = await masterReleaseService.get(masterId);
			if (cached) {
				return cached;
			}

			// Not in cache, fetch from API
			const masterRelease = await getMasterRelease(masterId);

			// Save to IndexedDB
			await masterReleaseService.save(masterRelease);

			return masterRelease;
		},

		onSuccess: (masterRelease, { instanceId }) => {
			// Update all collection query caches with the master year
			queryClient.setQueriesData<CollectionItemsResponse>(
				{ queryKey: ["collection"] },
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						releases: oldData.releases.map((release) =>
							release.instance_id === instanceId
								? { ...release, master_release_year: masterRelease.year }
								: release,
						),
					};
				},
			);
		},

		onError: (error: Error) => {
			console.error("Failed to fetch master release:", error);
		},
	});
}
