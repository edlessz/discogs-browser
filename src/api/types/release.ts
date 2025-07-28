export interface ReleaseInstance {
	instance_id: number;
	rating: number;
	basic_information: BasicInformation;
	folder_id: number;
	date_added: string; // ISO 8601 datetime string
	id: number;
}

export interface BasicInformation {
	id: number;
	master_id: number;
	master_url: string;
	resource_url: string;
	thumb: string;
	cover_image: string;
	title: string;
	year: number;
	formats: Format[];
	labels: Label[];
	artists: Artist[];
	genres: string[];
	styles: string[];
}

export interface Label {
	name: string;
	entity_type: string; // looks numeric but is string in example ("1")
	catno: string;
	resource_url: string;
	id: number;
	entity_type_name: string;
}

export interface Format {
	descriptions: string[]; // e.g. ["LP", "Album", ...]
	name: string; // e.g. "Vinyl"
	qty: string; // quantity as string, e.g. "2"
}

export interface Artist {
	join: string; // e.g. ","
	name: string;
	anv: string; // aka name variation? empty string if none
	tracks: string; // empty string in example
	role: string; // empty string in example
	resource_url: string;
	id: number;
}

export interface Video {
	duration: number;
	description: string;
	embed: boolean;
	uri: string;
	title: string;
}

export interface DiscogsImage {
	height: number;
	width: number;
	resource_url: string;
	uri: string;
	uri150: string;
	type: "primary" | "secondary";
}

export interface Track {
	position: string;
	type_: string;
	title: string;
	duration: string;
	extraartists?: ExtraArtist[];
}

export interface ExtraArtist {
	join: string;
	name: string;
	anv: string;
	tracks: string;
	role: string;
	resource_url: string;
	id: number;
}
