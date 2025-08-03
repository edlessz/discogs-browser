export interface Pagination {
	per_page: number;
	items: number;
	page: number;
	urls: {
		next?: string;
		prev?: string;
		first?: string;
		last?: string;
	};
	pages: number;
}
