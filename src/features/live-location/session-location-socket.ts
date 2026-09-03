import { io } from "socket.io-client";

import { getRealtimeBaseUrl } from "@/lib/api/config";

type SessionLocationAuthentication = { token: string } | { shareToken: string };

export function createSessionLocationSocket(
  authentication: SessionLocationAuthentication,
) {
  return io(`${getRealtimeBaseUrl()}/session-location`, {
    auth: authentication,
    transports: ["websocket", "polling"],
    tryAllTransports: true,
    timeout: 10_000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 750,
    reconnectionDelayMax: 5_000,
  });
}
