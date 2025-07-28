export interface Pagination {
	per_page: number;
	items: number;
	page: number;
	urls: Record<string, unknown>; // empty object in example, could be links or omitted
	pages: number;
}
