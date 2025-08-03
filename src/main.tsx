import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ToastProvider } from "./components/Toast/ToastProvider.tsx";

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<ToastProvider>
				<App />
			</ToastProvider>
		</StrictMode>,
	);
}
