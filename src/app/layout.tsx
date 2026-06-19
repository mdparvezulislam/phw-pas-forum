import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { auth } from "@/lib/auth";
import { getSiteUrl, getAppName } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: getAppName(),
    template: `%s | ${getAppName()}`,
  },
  description: "A premium community forum platform",
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: getSiteUrl(),
    siteName: getAppName(),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers sessionUser={session?.user ?? null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
