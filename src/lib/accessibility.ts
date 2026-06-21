/**
 * Accessibility utilities for focus management, reduced motion, and ARIA announcements.
 */

/** Detect if the user prefers reduced motion. Safe for SSR (returns false). */
export function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Trap keyboard focus within an element (e.g. modal, dialog, dropdown).
 * Returns a cleanup function that removes the keydown listener.
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusable = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKey(e: KeyboardEvent) {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }

  element.addEventListener("keydown", handleKey);
  first?.focus();

  return () => element.removeEventListener("keydown", handleKey);
}

/** Move focus to the main content area (for skip-link target). */
export function skipToContent() {
  const main = document.querySelector("main");
  if (main) {
    main.tabIndex = -1;
    main.focus();
  }
}

/** Announce a message to screen readers via a live region. */
export function announce(
  message: string,
  priority?: "polite" | "assertive",
): void {
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", priority ?? "polite");
  el.setAttribute("aria-atomic", "true");
  el.className = "sr-only";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
