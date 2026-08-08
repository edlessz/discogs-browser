import {
	createColumnHelper,
	createSortedRowModel,
	flexRender,
	rowSortingFeature,
	type SortingState,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { useMemo, useState } from "react";
import { type CollectionItem, cn } from "@/lib/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, CollectionItem>();

interface CollectionTableProps {
	className?: string;
	collection?: CollectionItem[];
}

export const CollectionTable = ({
	className = "",
	collection = [],
}: CollectionTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = useMemo(
		() =>
			columnHelper.columns([
				columnHelper.accessor((release) => release.basic_information.id, {
					header: "ID",
				}),
				columnHelper.accessor((release) => release.basic_information.title, {
					header: "Title",
				}),
				columnHelper.accessor(
					(release) => release.basic_information.year || "N/A",
					{
						header: "Year",
					},
				),
				columnHelper.accessor(
					(release) =>
						release.basic_information.artists
							.map((artist) => artist.name)
							.join(", "),
					{
						header: "Artists",
					},
				),
				columnHelper.accessor(
					(release) =>
						release.basic_information.formats
							?.map((format) => format.name)
							.filter((name) => name !== "All Media")
							.join(", ") ?? "",
					{
						header: "Formats",
					},
				),
			]),
		[],
	);

	const table = useTable({
		features,
		data: collection,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
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
							<TableRow key={row.id}>
								{row.getAllCells().map((cell) => (
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
