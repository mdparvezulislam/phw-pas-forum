"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllDisputesAction, getDisputeByIdAction, resolveDisputeAction, sendDisputeMessageAction } from "@/actions";
import type { Dispute, Order, User, MarketplaceListing, DisputeMessage } from "@/db/schema";

interface DisputeWithRelations extends Dispute {
  order: Order & { listing: MarketplaceListing };
  buyer: User;
  seller: User;
  messages?: (DisputeMessage & { sender: User })[];
}

export function AdminDisputeManagement() {
  const [disputes, setDisputes] = useState<DisputeWithRelations[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    const result = await getAllDisputesAction({ status: filterStatus || undefined, page, limit: 20 });
    if (result.success && result.data) {
      setDisputes(result.data.disputes);
      setTotalPages(result.data.totalPages);
    }
    setLoading(false);
  }, [filterStatus, page]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleSelectDispute = async (disputeId: string) => {
    const result = await getDisputeByIdAction(disputeId);
    if (result.success && result.dispute) {
      setSelectedDispute(result.dispute);
    }
  };

  const handleResolve = async (action: "RESOLVED" | "REJECTED") => {
    if (!selectedDispute) return;
    const resolution = prompt("Resolution details:");
    if (!resolution) return;
    await resolveDisputeAction({ disputeId: selectedDispute.id, resolution, action });
    setSelectedDispute(null);
    await fetchDisputes();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Disputes</h1>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-2">
              {disputes.map((dispute) => (
                <button
                  key={dispute.id}
                  onClick={() => handleSelectDispute(dispute.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                    selectedDispute?.id === dispute.id ? "border-primary bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      #{dispute.order?.orderNumber}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        dispute.status === "OPEN"
                          ? "text-red-600"
                          : dispute.status === "UNDER_REVIEW"
                            ? "text-yellow-600"
                            : dispute.status === "RESOLVED"
                              ? "text-green-600"
                              : "text-gray-600"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {dispute.reason}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dispute.buyer?.displayName ?? dispute.buyer?.username} vs{" "}
                    {dispute.seller?.displayName ?? dispute.seller?.username}
                  </p>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-muted-foreground">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedDispute ? (
          <DisputeDetailPanel
            dispute={selectedDispute}
            onResolve={handleResolve}
            onClose={() => setSelectedDispute(null)}
          />
        ) : (
          <div className="flex items-center justify-center rounded-lg border bg-card py-20 text-muted-foreground">
            <p>Select a dispute to review</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DisputeDetailPanel({
  dispute,
  onResolve,
  onClose,
}: {
  dispute: DisputeWithRelations;
  onResolve: (action: "RESOLVED" | "REJECTED") => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendDisputeMessageAction({
      disputeId: dispute.id,
      content: message,
      isModNote: 1,
    });
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Dispute on Order #{dispute.order?.orderNumber}
            </h2>
            <p className="text-sm text-muted-foreground">{dispute.reason}</p>
          </div>
          <span
            className={`text-sm font-medium ${
              dispute.status === "OPEN"
                ? "text-red-600"
                : dispute.status === "UNDER_REVIEW"
                  ? "text-yellow-600"
                  : dispute.status === "RESOLVED"
                    ? "text-green-600"
                    : "text-gray-600"
            }`}
          >
            {dispute.status}
          </span>
        </div>

        <div className="mb-4 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Description</p>
          <p className="mt-1 text-sm text-muted-foreground">{dispute.description}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Buyer:</span>
            <span className="ml-2 font-medium">
              {dispute.buyer?.displayName ?? dispute.buyer?.username}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Seller:</span>
            <span className="ml-2 font-medium">
              {dispute.seller?.displayName ?? dispute.seller?.username}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Listing:</span>
            <span className="ml-2">{dispute.order?.listing?.title}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <span className="ml-2 font-medium">
              ${(dispute.order?.amount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {dispute.status !== "RESOLVED" && dispute.status !== "REJECTED" && (
          <div className="flex gap-2">
            <button
              onClick={() => onResolve("RESOLVED")}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Resolve in Favor of Buyer
            </button>
            <button
              onClick={() => onResolve("REJECTED")}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Reject Dispute
            </button>
          </div>
        )}
      </div>

      {dispute.messages && (
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h3 className="font-medium">Messages</h3>
          </div>
          <div className="space-y-2 p-4">
            {dispute.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg p-3 ${
                  (msg as any).isModNote
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-muted"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {msg.sender?.displayName ?? msg.sender?.username ?? "Unknown"}
                  </span>
                  {(msg as any).isModNote ? (
                    <span className="rounded bg-yellow-200 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                      Mod Note
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
          {dispute.status !== "RESOLVED" && dispute.status !== "REJECTED" && (
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message (visible to buyer & seller)..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Messages are visible to both parties. Check &quot;Mod Note&quot; for internal notes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
