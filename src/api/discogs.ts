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
) => {
	const res = await client.get<CollectionItemsResponse>(
		`/users/${username}/collection/folders/${folderId}/releases`,
	);
	return res.data;
};

export const getMasterRelease = async (masterId: number) => {
	const res = await client.get<MasterRelease>(`/masters/${masterId}`);
	return res.data;
};
