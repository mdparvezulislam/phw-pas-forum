"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllOrdersAction, refundOrderAction } from "@/actions";
import type { MarketplaceListing, User } from "@/db/schema";
import type { Order } from "@/db/schema/orders";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderWithRelations extends Order {
  buyer: User;
  seller: User;
  listing: MarketplaceListing;
}

export function AdminOrderManagement() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await getAllOrdersAction({
      status: filterStatus || undefined,
      page,
      limit: 20,
    });
    if (result.success && result.data) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setLoading(false);
  }, [filterStatus, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefund = async (orderId: string, amount: number) => {
    const reason = prompt("Refund reason:");
    if (!reason) return;
    const result = await refundOrderAction({ orderId, amount, reason });
    if (result.success) {
      await fetchOrders();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DISPUTED">Disputed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Buyer</th>
                <th className="px-4 py-3 text-left font-medium">Seller</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.listing?.title}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {order.buyer?.displayName ??
                      order.buyer?.username ??
                      "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    {order.seller?.displayName ??
                      order.seller?.username ??
                      "Unknown"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ${(order.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {["DISPUTED", "REFUNDED"].includes(order.status) && (
                      <button
                        onClick={() => handleRefund(order.id, order.amount)}
                        className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-400"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
