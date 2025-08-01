import { Button } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import "./Toast.css";

export type ToastType = "error" | "success" | "info";

interface ToastProps {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
	onDismiss: (id: string) => void;
}

export function Toast({
	id,
	message,
	type,
	duration = 5000,
	onDismiss,
}: ToastProps) {
	const [isExiting, setIsExiting] = useState(false);

	const handleDismiss = useCallback(() => {
		setIsExiting(true);
		setTimeout(() => {
			onDismiss(id);
		}, 300); // Match animation duration
	}, [id, onDismiss]);

	useEffect(() => {
		const timer = setTimeout(() => {
			handleDismiss();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, handleDismiss]);

	const getTypeStyles = () => {
		switch (type) {
			case "error":
				return "bg-red-500 text-white";
			case "success":
				return "bg-green-500 text-white";
			case "info":
				return "bg-blue-500 text-white";
			default:
				return "bg-gray-500 text-white";
		}
	};

	return (
		<div
			className={`
				${getTypeStyles()}
				px-4 py-3 rounded-lg shadow-lg
				flex items-center justify-between gap-4
				min-w-[300px] max-w-[500px]
				${isExiting ? "toast-slide-out" : "toast-slide-in"}
			`}
		>
			<span className="text-sm font-medium">{message}</span>
			<Button
				type="button"
				className="text !p-1 text-lg aspect-square"
				onClick={handleDismiss}
			>
				&times;
			</Button>
		</div>
	);
}
