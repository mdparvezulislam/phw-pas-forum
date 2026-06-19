"use client";

import { Label } from "@/components/ui";
import { useTheme } from "@/hooks";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Customize your display preferences
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Theme</h2>
        <div className="flex flex-col gap-3">
          {(["light", "dark", "system"] as const).map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm has-[:checked]:border-primary"
            >
              <input
                type="radio"
                name="theme"
                value={option}
                checked={theme === option}
                onChange={() => setTheme(option)}
                className="h-4 w-4 accent-primary"
              />
              <span className="capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
