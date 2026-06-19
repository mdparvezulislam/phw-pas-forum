import { getEnv } from "@/validations/env";

export const siteConfig = {
  name: "BHW PAS",
  description: "A premium community forum platform",
  url: typeof window !== "undefined" ? window.location.origin : "",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/bhwpas",
    github: "https://github.com/bhw-pas",
  },
};

export function getSiteUrl(): string {
  try {
    const env = getEnv();
    return env.NEXT_PUBLIC_APP_URL;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
}

export function getAppName(): string {
  try {
    const env = getEnv();
    return env.NEXT_PUBLIC_APP_NAME;
  } catch {
    return "BHW PAS";
  }
}
