import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCollection } from "@/api/queries/useCollection";
import { CollectionCoverflow } from "@/components/CollectionCoverflow";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { config } from "@/config";
import { type CollectionItem, filterAndSortReleases } from "@/lib/utils";

export function CollectionBrowser() {
	const [selectedFormat, setSelectedFormat] = useState<string>("all");

	const username = config.discogsUsername;
	const { data, error } = useCollection(username, 0);

	useEffect(() => {
		if (error) toast.error("Failed to load collection.");
	}, [error]);

	const collection = useMemo<CollectionItem[] | undefined>(
		() => filterAndSortReleases(data?.releases ?? [], selectedFormat),
		[data, selectedFormat],
	);

	const formatFrequencies = useMemo<Record<string, number>>(() => {
		return (
			data?.releases?.reduce(
				(acc, release) => {
					new Set(
						release.basic_information.formats.map((x) => x.name),
					)?.forEach((format) => {
						if (format !== "All Media") acc[format] = (acc[format] || 0) + 1;
					});
					return acc;
				},
				{} as Record<string, number>,
			) ?? {}
		);
	}, [data]);

	if (!username) {
		return (
			<div className="h-full flex items-center justify-center p-6 text-center">
				<p className="text-muted-foreground max-w-md">
					Set <code className="text-foreground">VITE_DISCOGS_USERNAME</code> in
					your <code className="text-foreground">.env.local</code> to browse
					your collection here.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex gap-2 items-center p-4 justify-end">
				<RadioGroup
					className="flex"
					onValueChange={setSelectedFormat}
					value={selectedFormat}
				>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="all" id="all"></RadioGroupItem>
						<Label htmlFor="all">All ({data?.releases?.length ?? 0})</Label>
					</div>
					{Object.entries(formatFrequencies).map(([formatName, count]) => (
						<div key={formatName} className="flex items-center gap-2">
							<RadioGroupItem
								value={formatName}
								id={formatName}
							></RadioGroupItem>
							<Label htmlFor={formatName}>
								{formatName} ({count})
							</Label>
						</div>
					))}
				</RadioGroup>
			</div>
			<CollectionCoverflow className="w-full flex-1" collection={collection} />
		</div>
	);
}
