import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ForumBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function ForumBreadcrumbs({ items }: ForumBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/forums" className="hover:text-foreground">
        Forums
      </Link>
      {items.map((item, i) => (
        <span key={item.href ?? item.label} className="flex items-center gap-2">
          <span className="text-xs">/</span>
          {i === items.length - 1 ? (
            <span className="text-foreground">{item.label}</span>
          ) : item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
