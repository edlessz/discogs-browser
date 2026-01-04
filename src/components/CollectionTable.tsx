import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDownWideNarrow,
	ArrowUpNarrowWide,
	Check,
	Download,
	Loader2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useFetchMasterRelease } from "@/api/queries/useMasterRelease";
import { type CollectionItem, cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

interface CollectionTableProps {
	className?: string;
	collection?: CollectionItem[];
}

export const CollectionTable = ({
	className = "",
	collection = [],
}: CollectionTableProps) => {
	const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
	const [sorting, setSorting] = useState<SortingState>([]);
	const fetchMasterRelease = useFetchMasterRelease();

	const handleFetchMaster = useCallback(
		async (release: CollectionItem) => {
			const masterId = release.basic_information.master_id;
			const instanceId = release.instance_id;

			if (!masterId || masterId <= 0) {
				toast.error("No master release available for this item");
				return;
			}

			if (release.master_release_year) {
				toast.info("Master release data already loaded");
				return;
			}

			setLoadingRows((prev) => new Set(prev).add(instanceId));

			try {
				await fetchMasterRelease.mutateAsync({ masterId, instanceId });
				toast.success("Master release data loaded");
			} catch (_error) {
				toast.error("Failed to fetch master release data");
			} finally {
				setLoadingRows((prev) => {
					const newSet = new Set(prev);
					newSet.delete(instanceId);
					return newSet;
				});
			}
		},
		[fetchMasterRelease],
	);

	const columns = useMemo<ColumnDef<CollectionItem>[]>(
		() => [
			{
				accessorFn: (release) => release.basic_information.id,
				header: "ID",
				size: 80,
			},
			{
				accessorFn: (release) => release.basic_information.title,
				header: "Title",
				size: 300,
			},
			{
				accessorFn: (release) => release.basic_information.year || "N/A",
				header: "Year",
				size: 80,
			},
			{
				id: "master_year",
				accessorFn: (release) => release.master_release_year ?? -1,
				header: "Master Year",
				size: 120,
				cell: ({ row }) => {
					const release = row.original;
					const hasMasterYear = release.master_release_year !== undefined;

					return (
						<div className="flex items-center gap-2">
							{hasMasterYear ? (
								<>
									<span>{release.master_release_year}</span>
									<Check className="size-3 text-green-600 dark:text-green-400" />
								</>
							) : (
								<span className="text-muted-foreground">-</span>
							)}
						</div>
					);
				},
			},
			{
				accessorFn: (release) =>
					release.basic_information.artists
						.map((artist) => artist.name)
						.join(", "),
				header: "Artists",
				size: 200,
			},
			{
				accessorFn: (release) =>
					release.basic_information.formats
						?.map((format) => format.name)
						.filter((name) => name !== "All Media")
						.join(", ") ?? "",
				header: "Formats",
				size: 150,
			},
			{
				id: "actions",
				header: "",
				size: 100,
				enableSorting: false,
				cell: ({ row }) => {
					const release = row.original;
					const masterId = release.basic_information.master_id;
					const isLoading = loadingRows.has(release.instance_id);
					const hasCachedData = release.master_release_year !== undefined;
					const hasNoMaster = !masterId || masterId <= 0;

					return (
						<Button
							size="sm"
							variant={hasCachedData ? "outline" : "default"}
							onClick={() => handleFetchMaster(release)}
							disabled={isLoading || hasNoMaster}
							title={
								hasNoMaster
									? "No master release"
									: hasCachedData
										? "Cached"
										: "Fetch master data"
							}
						>
							{isLoading ? (
								<Loader2 className="size-4 animate-spin" />
							) : hasCachedData ? (
								<Check className="size-4" />
							) : (
								<Download className="size-4" />
							)}
						</Button>
					);
				},
			},
		],
		[loadingRows, handleFetchMaster],
	);

	const table = useReactTable({
		data: collection,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div className={cn(className, "overflow-auto")}>
			<Table>
				<TableHeader className="sticky top-0 bg-background z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<button
												type="button"
												className="flex items-center gap-2 cursor-pointer select-none"
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{header.column.getIsSorted() === "asc" && (
													<ArrowUpNarrowWide size={16} />
												)}
												{header.column.getIsSorted() === "desc" && (
													<ArrowDownWideNarrow size={16} />
												)}
											</button>
										) : (
											flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
