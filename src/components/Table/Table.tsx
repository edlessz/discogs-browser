import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { type Key, type ReactNode, useState } from "react";

export interface TableColumn<T> {
	field?: string;
	header: string;
	renderer?: (row: T) => ReactNode;
	sortable?: boolean;
	hidden?: boolean;
	key?: boolean;
}
export interface TableProps<T> {
	data: T[];
	columns?: TableColumn<T>[];
	className?: string;
	emptyMessage?: string;
}

const extractValue = (node: ReactNode): string | number => {
	if (typeof node === "string" || typeof node === "number") return node;
	else if (Array.isArray(node)) return node.map(extractValue).join("");
	else return String(node);
};

function getNestedValue<T>(obj: T, path: string): unknown {
	return path.split(".").reduce<unknown>((acc, part) => {
		if (
			acc !== null &&
			acc !== undefined &&
			typeof acc === "object" &&
			part in acc
		) {
			return (acc as Record<string, unknown>)[part];
		}
		return undefined;
	}, obj);
}

export function Table<T>({
	data,
	columns,
	className,
	emptyMessage = "No data available.",
}: TableProps<T>) {
	const columnKeys: TableColumn<T>[] =
		columns ||
		Object.keys(data[0] || {}).map((field) => ({
			field,
			header: field.split(".").pop() || field,
			key: false,
		}));
	const keyCol = columnKeys.find((c) => c.key);

	const [sort, setSort] = useState<{
		fieldIndex: number;
		direction: "asc" | "desc";
	} | null>(null);
	const handleSort = (fieldIndex?: number) => {
		if (fieldIndex === undefined || columns?.[fieldIndex]?.sortable !== true) {
			setSort(null);
			return;
		}
		if (sort === null || sort.fieldIndex !== fieldIndex)
			setSort({ fieldIndex: fieldIndex, direction: "asc" });
		else if (sort?.fieldIndex === fieldIndex && sort.direction === "asc")
			setSort({ fieldIndex: fieldIndex, direction: "desc" });
		else if (sort?.fieldIndex === fieldIndex && sort.direction === "desc")
			setSort(null); // reset sort
	};
	const getComputedValue = (row: T, col: TableColumn<T>): ReactNode => {
		if (col.renderer) return col.renderer(row);
		return String(getNestedValue(row, String(col.field)) ?? "");
	};
	const sorted = (data: T[]) => {
		if (sort === null) return data;
		const { fieldIndex, direction } = sort;

		const sortFn = (a: T, b: T): number => {
			const aValue = extractValue(getComputedValue(a, columnKeys[fieldIndex]));
			const bValue = extractValue(getComputedValue(b, columnKeys[fieldIndex]));

			if (typeof aValue === "number" && typeof bValue === "number")
				return aValue - bValue;
			else return String(aValue).localeCompare(String(bValue));
		};

		if (direction === "asc") return data.sort(sortFn);
		else return data.sort(sortFn).reverse();
	};

	return (
		<table aria-label="Data table" className={className}>
			<thead className="bg-gray-100">
				<tr>
					{columnKeys.map(
						(col, idx) =>
							!col.hidden && (
								<th
									key={col.field ?? idx}
									scope="col"
									className={`px-4 py-2 text-left ${col.sortable ? "clickable" : ""}`}
									onClick={() => handleSort(idx)}
								>
									<div className="flex gap-2 justify-between">
										{col.header}
										{col.sortable &&
											sort !== null &&
											sort?.fieldIndex === idx &&
											(sort.direction === "asc" ? (
												<ArrowDownNarrowWide />
											) : (
												<ArrowUpNarrowWide />
											))}
									</div>
								</th>
							),
					)}
				</tr>
			</thead>
			<tbody>
				{data.length === 0 ? (
					<tr>
						<td colSpan={columnKeys.length} className="text-gray-500 italic">
							{emptyMessage}
						</td>
					</tr>
				) : (
					sorted(data).map((row, idx) => {
						const key: Key = keyCol
							? (getNestedValue(row, String(keyCol.field)) as Key)
							: idx;
						return (
							<tr key={key}>
								{columnKeys.map(
									(col) =>
										!col.hidden && (
											<td key={String(col.field)} className="px-4 py-2">
												{getComputedValue(row, col)}
											</td>
										),
								)}
							</tr>
						);
					})
				)}
			</tbody>
		</table>
	);
}
