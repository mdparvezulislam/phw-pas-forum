"use client";

import { useState } from "react";
import { requireRole } from "@/modules/auth/guards";

interface AdminTransactionManagementProps {
  initialTransactions: any[];
}

export function AdminTransactionManagement({
  initialTransactions,
}: AdminTransactionManagementProps) {
  const [transactions] = useState<any[]>(initialTransactions);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction Management</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Buyer</th>
              <th className="px-4 py-3 text-left font-medium">Seller</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">
                  {txn.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3">#{txn.order?.orderNumber}</td>
                <td className="px-4 py-3">
                  {txn.buyer?.displayName ?? txn.buyer?.username ?? "Unknown"}
                </td>
                <td className="px-4 py-3">
                  {txn.seller?.displayName ?? txn.seller?.username ?? "Unknown"}
                </td>
                <td className="px-4 py-3 font-medium">
                  ${(txn.amount / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      txn.type === "PAYMENT"
                        ? "text-green-600"
                        : txn.type === "REFUND"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      txn.status === "SUCCESS"
                        ? "text-green-600"
                        : txn.status === "FAILED"
                          ? "text-red-600"
                          : txn.status === "REFUNDED"
                            ? "text-orange-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {txn.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(txn.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
