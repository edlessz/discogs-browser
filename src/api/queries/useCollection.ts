import { useQuery } from "@tanstack/react-query";
import type { CollectionItemsResponse } from "../types";
import { getCollectionItemsByFolder } from "../discogs";

export function useCollection(username: string, folderId = 0) {
	return useQuery<CollectionItemsResponse>({
		queryKey: ["collection", username, folderId],
		queryFn: async () => {
			return await getCollectionItemsByFolder(username, folderId);
		},
		enabled: !!username,
	});
}
