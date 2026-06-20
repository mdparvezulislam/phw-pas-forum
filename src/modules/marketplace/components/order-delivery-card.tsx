import type { OrderDelivery, User } from "@/db/schema";

interface DeliveryWithUser extends OrderDelivery {
  seller: User;
}

export function OrderDeliveryCard({ delivery }: { delivery: DeliveryWithUser }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Delivery</span>
          <span className="text-xs text-muted-foreground">
            by {delivery.seller.displayName ?? delivery.seller.username}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(delivery.deliveredAt).toLocaleDateString()}
        </span>
      </div>

      {delivery.deliveryMessage && (
        <p className="mb-2 text-sm">{delivery.deliveryMessage}</p>
      )}

      {delivery.attachments && (delivery.attachments as string[]).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(delivery.attachments as string[]).map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-primary/10 px-2 py-1 text-xs text-primary hover:underline"
            >
              Attachment {i + 1}
            </a>
          ))}
        </div>
      )}

      {delivery.revisionCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Revision {delivery.revisionCount + 1}
        </p>
      )}
    </div>
  );
}
