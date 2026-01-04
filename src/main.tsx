import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/components/ModeToggle.tsx";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<App />
					<Toaster />
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
