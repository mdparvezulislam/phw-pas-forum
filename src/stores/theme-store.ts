import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  setResolvedTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",
  resolvedTheme: "light",
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
}));
