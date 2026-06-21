/**
 * Haptics Vibrator Utility
 * Handles native-feel haptic vibrations on supporting mobile devices
 */

export const triggerHaptic = (pattern: number | number[]) => {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "vibrate" in navigator
  ) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration failures (e.g. security block or user preference)
    }
  }
};

export const haptics = {
  success: () => triggerHaptic([50]),
  error: () => triggerHaptic([100, 50, 100]),
  warning: () => triggerHaptic([70, 40, 70]),
  notification: () => triggerHaptic([40, 40]),
  achievement: () => triggerHaptic([100, 30, 100, 30, 150]),
  tap: () => triggerHaptic(10),
};
