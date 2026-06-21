// ── Layout / shell ──
export { AdminShell } from "./layout/admin-shell";
export { AdminSidebar } from "./layout/admin-sidebar";
export { AdminTopbar, type AdminUser } from "./layout/admin-topbar";
export { AdminMobileNav } from "./layout/admin-mobile-nav";

// ── Command palette ──
export { CommandPalette } from "./command/command-palette";

// ── Navigation config ──
export {
  ADMIN_NAV,
  ADMIN_NAV_FLAT,
  findNavItem,
  isNavItemActive,
  type AdminNavItem,
  type AdminNavSection,
} from "./nav-config";

// ── Data display ──
export { PageHeader } from "./data/page-header";
export { SectionCard } from "./data/section-card";
export { KpiCard, type KpiAccent } from "./data/kpi-card";
export {
  DataTable,
  type AdminColumn,
  type BulkAction,
  type RowAction,
} from "./data/data-table";

// Back-compat alias: old `StatsCard` API maps onto the new KpiCard.
export { KpiCard as StatsCard } from "./data/kpi-card";

// ── Charts ──
export {
  ChartContainer,
  AreaTrend,
  LineTrend,
  BarSeries,
  Donut,
  Sparkline,
  accentColor,
  type ChartAccent,
  type DonutDatum,
} from "./charts/chart-kit";
export { RevenueCard } from "./charts/revenue-card";

// ── Feedback ──
export {
  RealtimeActivityFeed,
  type ActivityEntry,
  type ActivityType,
} from "./feedback/realtime-activity-feed";
export { SecurityAlert, type AlertSeverity } from "./feedback/security-alert";
export { FeatureFlagCard, type FeatureFlag } from "./feedback/feature-flag-card";
export { PermissionMatrix } from "./feedback/permission-matrix";
export { AuditViewer, type AuditRow } from "./feedback/audit-viewer";
export { ModerationQueue, type QueueItem } from "./feedback/moderation-queue";

// ── Skeletons ──
export {
  ChartSkeleton,
  KpiSkeleton,
  AdminTableSkeleton,
  DashboardSkeleton,
  AnalyticsSkeleton,
  ModerationSkeleton,
} from "./skeletons";
