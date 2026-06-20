import { useEffect, useRef } from "react";

interface RealtimeEvent {
  channel: string;
  type: string;
  payload: any;
}

export function useRealtime(
  channels: string[],
  onMessage: (event: RealtimeEvent) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const channelsKey = channels.join(",");

  useEffect(() => {
    if (channels.length === 0) return;

    const channelsQuery = encodeURIComponent(channels.join(","));
    const url = `/api/realtime?channels=${channelsQuery}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "CONNECTED") {
            return;
          }
          onMessageRef.current(data);
        } catch (error) {
          console.error("[Realtime] Failed to parse event data:", error);
        }
      };

      eventSource.onerror = (err) => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        reconnectTimeout = setTimeout(connect, 3000); // Reconnect in 3 seconds
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [channelsKey]);
}
export default useRealtime;
