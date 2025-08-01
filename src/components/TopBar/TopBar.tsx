import { Button, Input } from "@headlessui/react";
import type { CollectionItemsResponse } from "../../api/types";

interface TopBarProps {
	username: string;
	setUsername: (username: string) => void;
	selectedFormat: string;
	setSelectedFormat: (format: string) => void;
	collection: CollectionItemsResponse | null;
	onLoadCollection: () => void;
}

export function TopBar({
	username,
	setUsername,
	selectedFormat,
	setSelectedFormat,
	collection,
	onLoadCollection,
}: TopBarProps) {
	const uniqueFormats = [
		...new Set(
			(collection?.releases ?? []).flatMap(
				(release) =>
					release.basic_information.formats?.map((format) => format.name) ?? [],
			),
		),
	].sort();

	return (
		<div className="flex gap-2 items-center justify-between">
			<div className="flex gap-2 items-center">
				<Input
					type="text"
					name="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					id="username"
					autoComplete="username"
					placeholder="Discogs Username"
				/>
				<Button type="button" onClick={onLoadCollection}>
					Load Collection
				</Button>
			</div>
			<div className="flex gap-2 items-center">
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						name="format"
						value="all"
						checked={selectedFormat === "all"}
						onChange={(e) => setSelectedFormat(e.target.value)}
						className="form-radio"
					/>
					<span>All</span>
				</label>
				{uniqueFormats.map((formatName) => (
					<label
						key={formatName}
						className="flex items-center gap-2 cursor-pointer"
					>
						<input
							type="radio"
							name="format"
							value={formatName}
							checked={selectedFormat === formatName}
							onChange={(e) => setSelectedFormat(e.target.value)}
							className="form-radio"
						/>
						<span>{formatName}</span>
					</label>
				))}
			</div>
		</div>
	);
}
