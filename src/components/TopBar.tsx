import type { ViewMode } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CollectionItem } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";

interface TopBarProps {
	username: string;
	setUsername: (username: string) => void;
	selectedFormat: string;
	setSelectedFormat: (format: string) => void;
	collection?: CollectionItem[];
	onLoadCollection: () => void;
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
}

export function TopBar({
	username,
	setUsername,
	selectedFormat,
	setSelectedFormat,
	collection = [],
	onLoadCollection,
	viewMode,
	setViewMode,
}: TopBarProps) {
	const uniqueFormats = [
		...new Set(
			collection.flatMap(
				(release) =>
					release.basic_information.formats?.map((format) => format.name) ?? [],
			),
		),
	]
		.filter((format) => format !== "All Media")
		.sort();

	const getFormatCount = (formatName: string) => {
		return collection.filter((release) =>
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
			<RadioGroup className="flex" onValueChange={setViewMode} value={viewMode}>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="table" id="r1"></RadioGroupItem>
					<Label htmlFor="r1">Table</Label>
				</div>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="coverflow" id="r2"></RadioGroupItem>
					<Label htmlFor="r2">Coverflow</Label>
				</div>
			</RadioGroup>
			<RadioGroup
				className="flex"
				onValueChange={setSelectedFormat}
				value={selectedFormat}
			>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="all" id="all"></RadioGroupItem>
					<Label htmlFor="all">All ({collection.length})</Label>
				</div>
				{uniqueFormats.map((formatName) => (
					<div key={formatName} className="flex items-center gap-2">
						<RadioGroupItem value={formatName} id={formatName}></RadioGroupItem>
						<Label htmlFor={formatName}>
							{formatName} ({getFormatCount(formatName)})
						</Label>
					</div>
				))}
			</RadioGroup>
			<ModeToggle />
		</div>
	);
}
