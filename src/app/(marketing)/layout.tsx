import type { Metadata } from "next";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "BHW PAS — Build. Learn. Network. Earn.",
    template: "%s | BHW PAS",
  },
  description:
    "Join thousands of entrepreneurs, marketers, developers and creators sharing knowledge, growing businesses and selling services.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BHW PAS",
    title: "BHW PAS — Build. Learn. Network. Earn.",
    description:
      "The Modern Community Platform for Entrepreneurs, Marketers, Creators and Digital Professionals.",
  },
};

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/community", label: "Community" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/premium", label: "Premium" },
  { href: "/pricing", label: "Pricing" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

/* ─── NAVBAR ─── */

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-lg font-bold tracking-tight">
            BHW<span className="text-premium">PAS</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:block">
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/auth/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 md:block"
          >
            Join Free
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

/* ─── MOBILE MENU ─── */

function MobileMenu() {
  return (
    <details className="group md:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-2 transition-colors hover:bg-accent">
        <Menu className="h-5 w-5 group-open:hidden" />
        <X className="hidden h-5 w-5 group-open:block" />
      </summary>
      <div className="fixed inset-x-0 top-16 border-b border-border bg-background p-4 shadow-lg">
        <nav className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-border" />
          <Link
            href="/auth/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
          >
            Join Free
          </Link>
        </nav>
      </div>
    </details>
  );
}

/* ─── FOOTER ─── */

function Footer() {
  const sections = [
    {
      title: "Platform",
      links: [
        { href: "/features", label: "Features" },
        { href: "/marketplace", label: "Marketplace" },
        { href: "/premium", label: "Premium" },
        { href: "/pricing", label: "Pricing" },
        { href: "/resources", label: "Resources" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/community", label: "Forums" },
        { href: "/members", label: "Members" },
        { href: "/changelog", label: "Changelog" },
        { href: "/partners", label: "Partners" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/blog", label: "Blog" },
        { href: "/careers", label: "Careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/cookies", label: "Cookie Policy" },
        { href: "/dmca", label: "DMCA" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight">
              BHW<span className="text-premium">PAS</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The modern community platform for entrepreneurs, marketers, creators, and digital
              professionals.
            </p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BHW PAS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
