import {
  Permission,
  RoleName,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from "@/types/rbac";
import { cn } from "@/lib/utils";

/**
 * Enterprise permission overview: roles × permission categories, each cell a
 * coverage bar (granted / total in that category). Reads from the RBAC config
 * — no data fetching, no mutation.
 */
function buildCategories() {
  const all = Object.values(Permission) as Permission[];
  const map = new Map<string, Permission[]>();
  for (const p of all) {
    const category = String(p).split(":")[0] ?? "other";
    const list = map.get(category) ?? [];
    list.push(p);
    map.set(category, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

const CATEGORIES = buildCategories();

function coverageColor(ratio: number): string {
  if (ratio === 0) return "bg-muted";
  if (ratio >= 1) return "bg-success";
  if (ratio >= 0.5) return "bg-info";
  return "bg-warning";
}

export function PermissionMatrix({ className }: { className?: string }) {
  const roles = (Object.values(RoleName) as RoleName[])
    .filter((r) => r !== RoleName.GUEST)
    .sort((a, b) => (ROLE_HIERARCHY[b] ?? 0) - (ROLE_HIERARCHY[a] ?? 0));

  return (
    <div className={cn("overflow-x-auto rounded-xl border", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-raised bg-muted/50 px-4 py-2.5 text-left font-medium text-muted-foreground">
              Role
            </th>
            {CATEGORIES.map(([category]) => (
              <th
                key={category}
                className="px-3 py-2.5 text-center font-medium capitalize text-muted-foreground"
              >
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const granted = new Set(ROLE_PERMISSIONS[role] ?? []);
            return (
              <tr
                key={role}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="sticky left-0 z-raised bg-card px-4 py-2.5 font-medium">
                  {role.replace(/_/g, " ")}
                </td>
                {CATEGORIES.map(([category, perms]) => {
                  const have = perms.filter((p) => granted.has(p)).length;
                  const ratio = perms.length ? have / perms.length : 0;
                  return (
                    <td key={category} className="px-3 py-2.5">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              coverageColor(ratio),
                            )}
                            style={{ width: `${ratio * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {have}/{perms.length}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
