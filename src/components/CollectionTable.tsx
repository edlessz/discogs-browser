import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { type CollectionItem, cn } from "@/lib/utils";
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
	const columns = useMemo<ColumnDef<CollectionItem>[]>(
		() => [
			{
				accessorFn: (release) => release.basic_information.id,
				header: "ID",
			},
			{
				accessorFn: (release) => release.basic_information.title,
				header: "Title",
			},
			{
				accessorFn: (release) => release.basic_information.year || "N/A",
				header: "Year",
			},
			{
				accessorFn: (release) =>
					release.basic_information.artists
						.map((artist) => artist.name)
						.join(", "),
				header: "Artists",
			},
			{
				accessorFn: (release) =>
					release.basic_information.formats
						?.map((format) => format.name)
						.filter((name) => name !== "All Media")
						.join(", ") ?? "",
				header: "Formats",
			},
		],
		[],
	);

	const table = useReactTable({
		data: collection,
		columns,
		getCoreRowModel: getCoreRowModel(),
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
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
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
