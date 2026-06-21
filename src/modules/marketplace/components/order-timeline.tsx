import type { Order, OrderDelivery, OrderRevision, User } from "@/db/schema";

interface OrderWithTimeline extends Order {
  deliveries: (OrderDelivery & { seller: User })[];
  revisions: (OrderRevision & { requester: User })[];
}

export function OrderTimeline({ order }: { order: OrderWithTimeline }) {
  const events: { date: Date; label: string; description: string }[] = [
    {
      date: new Date(order.createdAt),
      label: "Order Placed",
      description: "Order was created",
    },
  ];

  if (order.status !== "PENDING") {
    events.push({
      date: new Date(order.updatedAt),
      label: "Accepted",
      description: "Seller accepted the order",
    });
  }

  if (order.deliveries) {
    for (const delivery of order.deliveries) {
      events.push({
        date: new Date(delivery.deliveredAt),
        label: "Delivery",
        description: `Delivered by ${delivery.seller.displayName ?? delivery.seller.username}`,
      });
    }
  }

  if (order.revisions) {
    for (const rev of order.revisions) {
      events.push({
        date: new Date(rev.createdAt),
        label: "Revision Requested",
        description: `Revision: ${rev.reason}`,
      });
    }
  }

  if (order.completedAt) {
    events.push({
      date: new Date(order.completedAt),
      label: "Completed",
      description: "Order completed",
    });
  }

  if (order.cancelledAt) {
    events.push({
      date: new Date(order.cancelledAt),
      label: "Cancelled",
      description: order.cancelReason ?? "No reason provided",
    });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="relative space-y-4">
      {events.map((event, index) => (
        <div key={index} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
            {index < events.length - 1 && (
              <div className="h-full w-0.5 bg-border" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-xs text-muted-foreground">{event.description}</p>
            <p className="text-xs text-muted-foreground">
              {event.date.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
