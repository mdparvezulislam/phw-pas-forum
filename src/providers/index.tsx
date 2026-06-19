import type { ReactNode } from "react";
import type { SessionUser } from "@/types/auth";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: ReactNode;
  sessionUser: SessionUser | null;
}

export function Providers({ children, sessionUser }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="bhw-theme">
      <AuthProvider sessionUser={sessionUser}>{children}</AuthProvider>
    </ThemeProvider>
  );
}
