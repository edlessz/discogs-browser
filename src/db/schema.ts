import Dexie, { type EntityTable } from "dexie";
import type { MasterRelease } from "@/api/types";

// Extended interface for storage
export interface CachedMasterRelease {
	id: number; // Primary key - master_id
	data: MasterRelease; // Full master release data
	cachedAt: number; // Timestamp
	lastAccessedAt: number; // For cache cleanup
}

export class DiscogsDatabase extends Dexie {
	masterReleases!: EntityTable<CachedMasterRelease, "id">;

	constructor() {
		super("DiscogsDatabase");

		this.version(1).stores({
			// Index by id (master_id), also index by cachedAt for cleanup
			masterReleases: "id, cachedAt, lastAccessedAt",
		});
	}
}

// Singleton instance
export const db = new DiscogsDatabase();
