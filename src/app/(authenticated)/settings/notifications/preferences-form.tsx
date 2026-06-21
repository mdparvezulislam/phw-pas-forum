"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/actions/notifications";

interface Preference {
  id: string;
  replyNotifications: boolean;
  quoteNotifications: boolean;
  mentionNotifications: boolean;
  reactionNotifications: boolean;
  badgeNotifications: boolean;
  trophyNotifications: boolean;
  levelUpNotifications: boolean;
  systemNotifications: boolean;
  announcementNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface NotificationPreferencesFormProps {
  preferences: Preference;
}

export function NotificationPreferencesForm({
  preferences,
}: NotificationPreferencesFormProps) {
  const [formData, setFormData] = useState({
    replyNotifications: preferences.replyNotifications,
    quoteNotifications: preferences.quoteNotifications,
    mentionNotifications: preferences.mentionNotifications,
    reactionNotifications: preferences.reactionNotifications,
    badgeNotifications: preferences.badgeNotifications,
    trophyNotifications: preferences.trophyNotifications,
    levelUpNotifications: preferences.levelUpNotifications,
    systemNotifications: preferences.systemNotifications,
    announcementNotifications: preferences.announcementNotifications,
    emailNotifications: preferences.emailNotifications,
    pushNotifications: preferences.pushNotifications,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    const result = await updateNotificationPreferences(undefined, form);
    setSaving(false);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">In-App Notifications</h2>
        <div className="space-y-4">
          <PreferenceToggle
            label="Replies"
            description="When someone replies to your thread"
            checked={formData.replyNotifications}
            onChange={() => handleToggle("replyNotifications")}
          />
          <PreferenceToggle
            label="Quotes"
            description="When someone quotes your post"
            checked={formData.quoteNotifications}
            onChange={() => handleToggle("quoteNotifications")}
          />
          <PreferenceToggle
            label="Mentions"
            description="When someone mentions you"
            checked={formData.mentionNotifications}
            onChange={() => handleToggle("mentionNotifications")}
          />
          <PreferenceToggle
            label="Reactions"
            description="When someone reacts to your post"
            checked={formData.reactionNotifications}
            onChange={() => handleToggle("reactionNotifications")}
          />
          <PreferenceToggle
            label="Badges"
            description="When you earn a badge"
            checked={formData.badgeNotifications}
            onChange={() => handleToggle("badgeNotifications")}
          />
          <PreferenceToggle
            label="Trophies"
            description="When you unlock a trophy"
            checked={formData.trophyNotifications}
            onChange={() => handleToggle("trophyNotifications")}
          />
          <PreferenceToggle
            label="Level Up"
            description="When you level up"
            checked={formData.levelUpNotifications}
            onChange={() => handleToggle("levelUpNotifications")}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">System Notifications</h2>
        <div className="space-y-4">
          <PreferenceToggle
            label="System Messages"
            description="Important system announcements"
            checked={formData.systemNotifications}
            onChange={() => handleToggle("systemNotifications")}
          />
          <PreferenceToggle
            label="Community Announcements"
            description="Community-wide announcements"
            checked={formData.announcementNotifications}
            onChange={() => handleToggle("announcementNotifications")}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
        <p className="text-sm text-muted-foreground mb-4">Coming soon</p>
        <PreferenceToggle
          label="Email Notifications"
          description="Receive notifications via email"
          checked={formData.emailNotifications}
          onChange={() => handleToggle("emailNotifications")}
          disabled
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Push Notifications</h2>
        <p className="text-sm text-muted-foreground mb-4">Coming soon</p>
        <PreferenceToggle
          label="Push Notifications"
          description="Receive push notifications on your device"
          checked={formData.pushNotifications}
          onChange={() => handleToggle("pushNotifications")}
          disabled
        />
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-green-500">Saved successfully!</span>
        )}
      </div>
    </div>
  );
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
