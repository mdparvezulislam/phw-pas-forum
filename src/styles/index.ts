/* ============================================
   DESIGN TOKENS — STYLES INDEX
   Programmatic access to design tokens
   ============================================ */

export const colors = {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  warning: {
    DEFAULT: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
  },
  danger: {
    DEFAULT: "hsl(var(--danger))",
    foreground: "hsl(var(--danger-foreground))",
  },
  info: {
    DEFAULT: "hsl(var(--info))",
    foreground: "hsl(var(--info-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  premium: {
    DEFAULT: "hsl(var(--premium))",
    foreground: "hsl(var(--premium-foreground))",
  },
  marketplace: {
    DEFAULT: "hsl(var(--marketplace))",
    foreground: "hsl(var(--marketplace-foreground))",
  },
  vip: {
    DEFAULT: "hsl(var(--vip))",
    foreground: "hsl(var(--vip-foreground))",
  },
  moderator: {
    DEFAULT: "hsl(var(--moderator))",
    foreground: "hsl(var(--moderator-foreground))",
  },
  admin: {
    DEFAULT: "hsl(var(--admin))",
    foreground: "hsl(var(--admin-foreground))",
  },
  border: "hsl(var(--border))",
  "border-strong": "hsl(var(--border-strong))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
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

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
    display: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  },
  fontSize: {
    "display-xl": "4.5rem",
    "display-lg": "3.75rem",
    "display-md": "3rem",
    "display-sm": "2.25rem",
    "heading-1": "2rem",
    "heading-2": "1.5rem",
    "heading-3": "1.25rem",
    "heading-4": "1.125rem",
    "body-lg": "1.125rem",
    body: "1rem",
    "body-sm": "0.875rem",
    caption: "0.75rem",
    label: "0.75rem",
    overline: "0.625rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
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
