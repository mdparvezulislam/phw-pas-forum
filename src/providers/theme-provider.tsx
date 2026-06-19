"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "bhw-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const applyTheme = useCallback((newTheme: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    setResolvedTheme(newTheme);
  }, []);

  const resolveSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {}

      const resolved = newTheme === "system" ? resolveSystemTheme() : newTheme;
      applyTheme(resolved);
    },
    [storageKey, resolveSystemTheme, applyTheme],
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    const initial = stored ?? defaultTheme;
    setThemeState(initial);

    const resolved = initial === "system" ? resolveSystemTheme() : initial;
    applyTheme(resolved);
  }, [storageKey, defaultTheme, resolveSystemTheme, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        applyTheme(resolveSystemTheme());
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, resolveSystemTheme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
