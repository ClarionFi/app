import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") {
		return;
	}

	document.documentElement.classList.toggle("dark", theme === "dark");
}

type ThemeProviderProps = {
	children: ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

export function ThemeProvider({
	children,
	defaultTheme = "light",
	storageKey = "clarionfi-theme",
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const storedTheme = window.localStorage.getItem(storageKey);
		const initialTheme = storedTheme === "dark" ? "dark" : "light";
		setThemeState(initialTheme);
		applyTheme(initialTheme);
	}, [storageKey]);

	const setTheme = (nextTheme: Theme) => {
		setThemeState(nextTheme);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(storageKey, nextTheme);
		}
		applyTheme(nextTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
