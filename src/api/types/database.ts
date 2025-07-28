import type { Artist, DiscogsImage, Track, Video } from "./release";

export interface MasterRelease {
	id: number;
	title: string;
	year: number;
	main_release: number;
	main_release_url: string;
	uri: string;
	resource_url: string;
	versions_url: string;
	artists: Artist[];
	genres: string[];
	styles: string[];
	videos: Video[];
	images: DiscogsImage[];
	tracklist: Track[];
	num_for_sale: number;
	lowest_price: number;
	data_quality: string;
}
