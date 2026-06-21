import type { OrderStatus } from "@/db/schema/orders";

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400",
    },
    ACCEPTED: {
      label: "Accepted",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400",
    },
    DELIVERED: {
      label: "Delivered",
      className:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400",
    },
    COMPLETED: {
      label: "Completed",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
    },
    CANCELLED: {
      label: "Cancelled",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    },
    DISPUTED: {
      label: "Disputed",
      className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
    },
    REFUNDED: {
      label: "Refunded",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-400",
    },
  };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
