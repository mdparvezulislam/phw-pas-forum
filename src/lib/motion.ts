import type { Variants, Transition } from "framer-motion";

/* ============================================
   MOTION SYSTEM
   Animation presets for Framer Motion
   ============================================ */

// ── Duration Constants ──
export const duration = {
  instant: 0,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
  slowest: 1,
} as const;

// ── Easing Curves ──
export const easing = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// ── Standard Transitions ──
export const transitions: Record<string, Transition> = {
  fast: { duration: duration.fast, ease: easing.easeOut },
  normal: { duration: duration.normal, ease: easing.easeInOut },
  slow: { duration: duration.slow, ease: easing.easeInOut },
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 24,
  },
  springGentle: {
    type: "spring",
    stiffness: 200,
    damping: 20,
  },
  springBouncy: {
    type: "spring",
    stiffness: 400,
    damping: 17,
  },
} as const;

// ── Page Transition Variants ──
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
};

// ── Fade Variants ──
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// ── Scale Variants ──
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// ── Slide Variants ──
export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: duration.normal, ease: easing.easeIn },
  },
};

export const slideInLeft: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: duration.normal, ease: easing.easeIn },
  },
};

export const slideInBottom: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: duration.normal, ease: easing.easeIn },
  },
};

// ── Stagger Container ──
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// ── Stagger Item ──
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
};

// ── Hover Variants ──
export const hoverLift = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: duration.fast, ease: easing.easeOut },
  },
};

export const hoverScale = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: duration.fast, ease: easing.easeOut },
  },
};

// ── List Item Variants ──
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: -8,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// ── Overlay Variants ──
export const overlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// ── Drawer Variants ──
export const drawer = {
  overlay,
  content: slideInRight,
};

// ── Dialog Variants ──
export const dialog = {
  overlay,
  content: scaleIn,
};

// ── Dropdown Variants ──
export const dropdown: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// ── Toast Variants ──
export const toast = {
  ...slideInBottom,
  hidden: { ...slideInBottom.hidden, x: "-50%" },
  visible: { ...slideInBottom.visible, x: "-50%" },
  exit: { ...slideInBottom.exit, x: "-50%" },
};

// ── Tooltip Variants ──
export const tooltip: Variants = {
  hidden: { opacity: 0, y: 4, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.fast, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.96,
    transition: { duration: 100, ease: easing.easeIn },
  },
};

// ── Pulse Animation ──
export const pulse: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

// ── Shimmer Animation ──
export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

// ── Spinning Animation ──
export const spin: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
};
