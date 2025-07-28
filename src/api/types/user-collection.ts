import type { Pagination } from "./pagination";
import type { ReleaseInstance } from "./release";

export interface CollectionFoldersResponse {
	folders: CollectionFolder[];
}

export interface CollectionFolder {
	id: number;
	name: string;
	count: number;
	resource_url: string;
}

export interface CollectionItemsResponse {
	pagination: Pagination;
	releases: ReleaseInstance[];
}
