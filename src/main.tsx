import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ModeToggle.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<ThemeProvider>
				<App />
				<Toaster />
			</ThemeProvider>
		</StrictMode>,
	);
}
