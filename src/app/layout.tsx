import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getAppName, getSiteUrl } from "@/config/site";
import { auth } from "@/lib/auth";
import { Providers } from "@/providers";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers sessionUser={session?.user ?? null}>{children}</Providers>
      </body>
    </html>
  );
}
