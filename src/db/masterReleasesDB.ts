import type { MasterRelease } from "../api/types";

const DB_NAME = "DiscogsCache";
const STORE_NAME = "masterReleases";
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> =>
	new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
	});

export async function getCachedMasterRelease(
	id: number,
): Promise<MasterRelease | null> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const request = store.get(id);
		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
}

export async function getAllCachedMasterReleases(): Promise<
	Record<number, MasterRelease>
> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("masterReleases", "readonly");
		const store = tx.objectStore("masterReleases");
		const request = store.getAll();

		request.onsuccess = () => {
			const resultArray = request.result as MasterRelease[];
			const resultObject: { [key: number]: MasterRelease } = {};
			for (const release of resultArray) {
				resultObject[release.id] = release;
			}
			resolve(resultObject);
		};

		request.onerror = () => reject(request.error);
	});
}

export async function cacheMasterRelease(
	release: MasterRelease,
): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		const request = store.put(release);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}
