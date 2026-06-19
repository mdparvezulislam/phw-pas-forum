import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import type { SessionUser } from "@/types/auth";

interface ProvidersProps {
  children: ReactNode;
  sessionUser: SessionUser | null;
}

export function Providers({ children, sessionUser }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="bhw-theme">
      <AuthProvider sessionUser={sessionUser}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
