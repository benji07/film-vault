import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "filmvault-theme";

const ThemeContext = createContext<ThemeContextValue>({
	theme: "dark",
	setTheme: () => {},
});

export function useTheme() {
	return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === "light" ? "light" : "dark";
	});

	const setTheme = (t: Theme) => {
		setThemeState(t);
		localStorage.setItem(STORAGE_KEY, t);
	};

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "light") {
			root.classList.add("light");
		} else {
			root.classList.remove("light");
		}
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute("content", theme === "light" ? "#F5F0E8" : "#0D0D0D");
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
