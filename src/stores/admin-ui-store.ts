import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 6;
const MAX_FAVORITES = 8;

interface AdminUIState {
  /** Desktop sidebar collapsed to icon-rail. Persisted. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Pinned favorite routes (hrefs). Persisted. */
  pinnedFavorites: string[];
  toggleFavorite: (href: string) => void;
  isFavorite: (href: string) => boolean;

  /** Recently visited routes (hrefs), most-recent first. Persisted. */
  recentPages: string[];
  pushRecent: (href: string) => void;

  /** Command palette open state. Not persisted. */
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;

  /** Mobile drawer open state. Not persisted. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useAdminUI = create<AdminUIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      pinnedFavorites: [],
      toggleFavorite: (href) =>
        set((s) => {
          if (s.pinnedFavorites.includes(href)) {
            return {
              pinnedFavorites: s.pinnedFavorites.filter((h) => h !== href),
            };
          }
          return {
            pinnedFavorites: [href, ...s.pinnedFavorites].slice(
              0,
              MAX_FAVORITES,
            ),
          };
        }),
      isFavorite: (href) => get().pinnedFavorites.includes(href),

      recentPages: [],
      pushRecent: (href) =>
        set((s) => ({
          recentPages: [href, ...s.recentPages.filter((h) => h !== href)].slice(
            0,
            MAX_RECENT,
          ),
        })),

      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

      mobileNavOpen: false,
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
    }),
    {
      name: "bhw-admin-ui",
      // only persist durable preferences
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        pinnedFavorites: s.pinnedFavorites,
        recentPages: s.recentPages,
      }),
    },
  ),
);
