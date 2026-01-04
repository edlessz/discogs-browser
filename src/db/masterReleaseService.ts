import type { MasterRelease } from "@/api/types";
import { db } from "./schema";

/**
 * Get a cached master release
 */
async function get(masterId: number): Promise<MasterRelease | undefined> {
	try {
		const cached = await db.masterReleases.get(masterId);

		if (cached) {
			// Update last accessed timestamp
			await db.masterReleases.update(masterId, {
				lastAccessedAt: Date.now(),
			});
			return cached.data;
		}

		return undefined;
	} catch (error) {
		console.error(`Failed to get master release ${masterId}:`, error);
		return undefined;
	}
}

/**
 * Save a master release to cache
 */
async function save(masterRelease: MasterRelease): Promise<void> {
	try {
		const now = Date.now();
		await db.masterReleases.put({
			id: masterRelease.id,
			data: masterRelease,
			cachedAt: now,
			lastAccessedAt: now,
		});
	} catch (error) {
		console.error(`Failed to save master release ${masterRelease.id}:`, error);
		throw error;
	}
}

/**
 * Get multiple master releases by IDs
 */
async function getMany(
	masterIds: number[],
): Promise<Map<number, MasterRelease>> {
	try {
		const cached = await db.masterReleases.bulkGet(masterIds);
		const result = new Map<number, MasterRelease>();

		cached.forEach((item) => {
			if (item) {
				result.set(item.id, item.data);
			}
		});

		// Update last accessed for all retrieved items
		const updates = cached
			.filter((item): item is NonNullable<typeof item> => item !== undefined)
			.map((item) => ({
				key: item.id,
				changes: { lastAccessedAt: Date.now() },
			}));

		if (updates.length > 0) {
			await db.masterReleases.bulkUpdate(updates);
		}

		return result;
	} catch (error) {
		console.error("Failed to get multiple master releases:", error);
		return new Map();
	}
}

/**
 * Check if a master release is cached
 */
async function has(masterId: number): Promise<boolean> {
	try {
		const count = await db.masterReleases.where("id").equals(masterId).count();
		return count > 0;
	} catch (error) {
		console.error(`Failed to check master release ${masterId}:`, error);
		return false;
	}
}

/**
 * Clear old cache entries (optional - for maintenance)
 * Remove entries older than specified days
 */
async function clearOldEntries(daysOld = 90): Promise<number> {
	try {
		const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
		return await db.masterReleases.where("cachedAt").below(cutoffTime).delete();
	} catch (error) {
		console.error("Failed to clear old cache entries:", error);
		return 0;
	}
}

/**
 * Get cache statistics
 */
async function getStats() {
	try {
		const totalCount = await db.masterReleases.count();
		const oldestEntry = await db.masterReleases.orderBy("cachedAt").first();
		const newestEntry = await db.masterReleases
			.orderBy("cachedAt")
			.reverse()
			.first();

		return {
			totalCount,
			oldestCacheDate: oldestEntry?.cachedAt,
			newestCacheDate: newestEntry?.cachedAt,
		};
	} catch (error) {
		console.error("Failed to get cache stats:", error);
		return null;
	}
}

export const masterReleaseService = {
	get,
	save,
	getMany,
	has,
	clearOldEntries,
	getStats,
};
