import type { Key, ReactNode } from "react";

export interface TableColumn<T> {
	field?: string;
	header: string;
	renderer?: (row: T) => ReactNode;
	hidden?: boolean;
	key?: boolean;
}
export interface TableProps<T> {
	data: T[];
	columns?: TableColumn<T>[];
	className?: string;
	emptyMessage?: string;
}

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

	const getComputedValue = (row: T, col: TableColumn<T>): ReactNode => {
		if (col.renderer) return col.renderer(row);
		return String(getNestedValue(row, String(col.field)) ?? "");
	};

	return (
		<table aria-label="Data table" className={className}>
			<thead className="bg-card sticky top-0 z-10">
				<tr>
					{columnKeys.map(
						(col, idx) =>
							!col.hidden && (
								<th
									key={col.field ?? idx}
									scope="col"
									className="px-4 py-2 text-left bg-card"
								>
									<div className="flex gap-2 justify-between">{col.header}</div>
								</th>
							),
					)}
				</tr>
			</thead>
			<tbody>
				{data.length === 0 ? (
					<tr>
						<td
							colSpan={columnKeys.length}
							className="text-muted-foreground italic"
						>
							{emptyMessage}
						</td>
					</tr>
				) : (
					data.map((row, idx) => {
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
