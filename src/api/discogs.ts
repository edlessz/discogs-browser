import client from "./discogsClient";
import type {
	CollectionFoldersResponse,
	CollectionItemsResponse,
	MasterRelease,
} from "./types";

export const getCollectionFolders = async (username: string) => {
	const res = await client.get<CollectionFoldersResponse>(
		`/users/${username}/collection/folders`,
	);
	return res.data;
};

export const getCollectionItemsByFolder = async (
	username: string,
	folderId: number,
): Promise<CollectionItemsResponse> => {
	let allReleases: CollectionItemsResponse["releases"] = [];
	let nextUrl: string | undefined =
		`/users/${username}/collection/folders/${folderId}/releases`;
	let lastResponse: CollectionItemsResponse | null = null;

	while (nextUrl) {
		// Extract path from full URL if needed
		const url: string = nextUrl.startsWith("http")
			? new URL(nextUrl).pathname + new URL(nextUrl).search
			: nextUrl;
		const res = await client.get<CollectionItemsResponse>(url);
		lastResponse = res.data;
		allReleases = [...allReleases, ...res.data.releases];

		// Get the next URL from pagination, or undefined if no more pages
		nextUrl = res.data.pagination.urls.next;
	}

	// Return the combined results with updated pagination info
	if (!lastResponse) {
		throw new Error("No response received from API");
	}

	return {
		...lastResponse,
		releases: allReleases,
		pagination: {
			...lastResponse.pagination,
			items: allReleases.length,
			page: 1,
			pages: 1,
			urls: {},
			per_page: allReleases.length,
		},
	};
};

export const getMasterRelease = async (masterId: number) => {
	const res = await client.get<MasterRelease>(`/masters/${masterId}`);
	return res.data;
};
