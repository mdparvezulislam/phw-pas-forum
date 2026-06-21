/* ============================================
   DESIGN TOKENS
   Central source of truth for design system
   ============================================ */

export const colors = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    card: "hsl(0 0% 100%)",
    "card-foreground": "hsl(240 10% 3.9%)",
    popover: "hsl(0 0% 100%)",
    "popover-foreground": "hsl(240 10% 3.9%)",
    primary: "hsl(240 5.9% 10%)",
    "primary-foreground": "hsl(0 0% 98%)",
    secondary: "hsl(240 4.8% 95.9%)",
    "secondary-foreground": "hsl(240 5.9% 10%)",
    muted: "hsl(240 4.8% 95.9%)",
    "muted-foreground": "hsl(240 3.8% 46.1%)",
    accent: "hsl(240 4.8% 95.9%)",
    "accent-foreground": "hsl(240 5.9% 10%)",
    destructive: "hsl(0 84% 60%)",
    "destructive-foreground": "hsl(0 0% 98%)",
    border: "hsl(240 5.9% 90%)",
    input: "hsl(240 5.9% 90%)",
    ring: "hsl(240 5.9% 10%)",
  },
  dark: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(240 10% 3.9%)",
    "card-foreground": "hsl(0 0% 98%)",
    popover: "hsl(240 10% 3.9%)",
    "popover-foreground": "hsl(0 0% 98%)",
    primary: "hsl(0 0% 98%)",
    "primary-foreground": "hsl(240 5.9% 10%)",
    secondary: "hsl(240 3.7% 15.9%)",
    "secondary-foreground": "hsl(0 0% 98%)",
    muted: "hsl(240 3.7% 15.9%)",
    "muted-foreground": "hsl(240 5% 64.9%)",
    accent: "hsl(240 3.7% 15.9%)",
    "accent-foreground": "hsl(0 0% 98%)",
    destructive: "hsl(0 62.8% 30.6%)",
    "destructive-foreground": "hsl(0 0% 98%)",
    border: "hsl(240 3.7% 15.9%)",
    input: "hsl(240 3.7% 15.9%)",
    ring: "hsl(240 4.9% 83.9%)",
  },
} as const;

export const semanticColors = {
  success: {
    DEFAULT: "hsl(142 76% 36%)",
    foreground: "hsl(0 0% 98%)",
  },
  warning: {
    DEFAULT: "hsl(38 92% 50%)",
    foreground: "hsl(0 0% 98%)",
  },
  danger: {
    DEFAULT: "hsl(0 84% 60%)",
    foreground: "hsl(0 0% 98%)",
  },
  info: {
    DEFAULT: "hsl(221 83% 53%)",
    foreground: "hsl(0 0% 98%)",
  },
  premium: {
    DEFAULT: "hsl(262 83% 58%)",
    foreground: "hsl(0 0% 98%)",
  },
  marketplace: {
    DEFAULT: "hsl(199 89% 48%)",
    foreground: "hsl(0 0% 98%)",
  },
  vip: {
    DEFAULT: "hsl(262 83% 58%)",
    foreground: "hsl(0 0% 98%)",
  },
  moderator: {
    DEFAULT: "hsl(24 95% 53%)",
    foreground: "hsl(0 0% 98%)",
  },
  admin: {
    DEFAULT: "hsl(0 72% 51%)",
    foreground: "hsl(0 0% 98%)",
  },
} as const;

export const spacing = {
  px: "1px",
  0: "0px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
} as const;

export const radii = {
  none: "0px",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
    display: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  },
  fontSize: {
    "display-xl": [
      "4.5rem",
      { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" },
    ],
    "display-lg": [
      "3.75rem",
      { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" },
    ],
    "display-md": [
      "3rem",
      { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" },
    ],
    "display-sm": [
      "2.25rem",
      { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" },
    ],
    "heading-1": [
      "2rem",
      { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" },
    ],
    "heading-2": [
      "1.5rem",
      { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
    ],
    "heading-3": [
      "1.25rem",
      { lineHeight: "1.35", letterSpacing: "-0.005em", fontWeight: "600" },
    ],
    "heading-4": [
      "1.125rem",
      { lineHeight: "1.4", letterSpacing: "-0.005em", fontWeight: "600" },
    ],
    "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
    body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
    "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
    caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
    label: [
      "0.75rem",
      { lineHeight: "1.5", fontWeight: "600", letterSpacing: "0.02em" },
    ],
    overline: [
      "0.625rem",
      { lineHeight: "1.5", fontWeight: "600", letterSpacing: "0.05em" },
    ],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

export const zIndex = {
  behind: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  drawer: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const animation = {
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
    slowest: "1000ms",
  },
  easing: {
    "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
    "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
    "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

export const layout = {
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  header: {
    height: "3.5rem",
  },
  sidebar: {
    width: "16rem",
    collapsedWidth: "4rem",
  },
} as const;
