import type { ThreadStatus } from "@/db/schema/threads";

interface ThreadStatusBadgeProps {
  status: ThreadStatus;
}

const statusLabels: Record<ThreadStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  PENDING: {
    label: "Pending",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
};

export function ThreadStatusBadge({ status }: ThreadStatusBadgeProps) {
  const config = statusLabels[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
