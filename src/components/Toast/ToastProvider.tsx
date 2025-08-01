import { createContext, type ReactNode, useContext, useState } from "react";
import { Toast, type ToastType } from "./Toast";

interface ToastItem {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

interface ToastContextType {
	showToast: (message: string, type: ToastType, duration?: number) => void;
	showError: (message: string) => void;
	showSuccess: (message: string) => void;
	showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const showToast = (message: string, type: ToastType, duration?: number) => {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: ToastItem = { id, message, type, duration };
		setToasts((prev) => [...prev, newToast]);
	};

	const showError = (message: string) => showToast(message, "error");
	const showSuccess = (message: string) => showToast(message, "success");
	const showInfo = (message: string) => showToast(message, "info");

	const dismissToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	return (
		<ToastContext.Provider
			value={{ showToast, showError, showSuccess, showInfo }}
		>
			{children}
			<div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
				{toasts.map((toast) => (
					<Toast
						key={toast.id}
						id={toast.id}
						message={toast.message}
						type={toast.type}
						duration={toast.duration}
						onDismiss={dismissToast}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
}
