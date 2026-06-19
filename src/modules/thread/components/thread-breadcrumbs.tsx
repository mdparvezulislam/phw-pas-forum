import Link from "next/link";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ThreadBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function ThreadBreadcrumbs({ items }: ThreadBreadcrumbsProps) {
  return (
    <nav
      aria-label="Thread breadcrumb"
      className="mb-4 text-sm text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <span aria-hidden="true">/</span>}
            <li>
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
