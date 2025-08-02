import { Button, Input } from "@headlessui/react";
import type { CollectionItemsResponse } from "../../api/types";

type ViewMode = "table" | "coverflow";

interface TopBarProps {
	username: string;
	setUsername: (username: string) => void;
	selectedFormat: string;
	setSelectedFormat: (format: string) => void;
	collection: CollectionItemsResponse | null;
	onLoadCollection: () => void;
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
}

export function TopBar({
	username,
	setUsername,
	selectedFormat,
	setSelectedFormat,
	collection,
	onLoadCollection,
	viewMode,
	setViewMode,
}: TopBarProps) {
	const releases = collection?.releases ?? [];
	const uniqueFormats = [
		...new Set(
			releases.flatMap(
				(release) =>
					release.basic_information.formats?.map((format) => format.name) ?? [],
			),
		),
	]
		.filter((format) => format !== "All Media")
		.sort();

	const getFormatCount = (formatName: string) => {
		return releases.filter((release) =>
			release.basic_information.formats?.some(
				(format) => format.name === formatName,
			),
		).length;
	};

	return (
		<div className="flex gap-2 items-center justify-between p-4">
			<div className="flex gap-2 items-center">
				<Input
					type="text"
					name="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							onLoadCollection();
						}
					}}
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
						name="viewMode"
						value="table"
						checked={viewMode === "table"}
						onChange={(e) => setViewMode(e.target.value as ViewMode)}
						className="form-radio"
					/>
					<span>Table</span>
				</label>
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						name="viewMode"
						value="coverflow"
						checked={viewMode === "coverflow"}
						onChange={(e) => setViewMode(e.target.value as ViewMode)}
						className="form-radio"
					/>
					<span>Coverflow</span>
				</label>
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
					<span>All ({releases.length})</span>
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
						<span>
							{formatName} ({getFormatCount(formatName)})
						</span>
					</label>
				))}
			</div>
		</div>
	);
}
