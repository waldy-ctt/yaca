// src/renderer/src/lib/api.ts
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/routes";
import { MessageModel } from "@/types"; // Ensure this matches your shared types

// 1. DYNAMIC URL HANDLING
// We replace 'http' with 'ws' (or 'https' with 'wss') to match the protocol automatically.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

// -------------------------------------------------------------------------
// 1. REST API WRAPPER
// -------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic API wrapper handling Auth headers and Error parsing.
 */
export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { token, logout } = useAuthStore.getState();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  // Handle Unauthorized (401)
  if (res.status === 401) {
    logout();
    router.navigate({ to: "/login" });
    
    let errorMsg = "Unauthorized";
    try {
      const json = await res.json();
      if (json.error) errorMsg = json.error;
    } catch {
      // ignore parsing error if response isn't JSON
    }
    throw new ApiError(errorMsg, 401);
  }

  // Handle other errors
  if (!res.ok) {
    const errorText = await res.text();
    throw new ApiError(errorText || res.statusText, res.status);
  }

  // Handle 204 No Content (Empty success)
  if (res.status === 204) return {} as T;

  // Parse JSON response
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Typed Helper Methods
export const apiGet = <T>(url: string) => api<T>(url, { method: "GET" });

export const apiPost = <T, B = unknown>(url: string, body?: B) =>
  api<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T, B = unknown>(url: string, body?: B) =>
  api<T>(url, { 
    method: "PUT", 
    body: body ? JSON.stringify(body) : undefined 
  });

export const apiDelete = <T>(url: string) => api<T>(url, { method: "DELETE" });

// -------------------------------------------------------------------------
// 2. WEBSOCKET TYPING SYSTEM
// -------------------------------------------------------------------------

/**
 * INCOMING EVENTS: What the Client RECEIVES from Backend.
 * The backend sends flat JSON: { type: "EVENT", ...payload }
 * We define the payload shape here (excluding the 'type' key).
 */
export interface WebSocketEventMap {
  "NEW_MESSAGE": { message: MessageModel };
  "ACK": { tempId: string; message: MessageModel };
  "MESSAGE_UPDATED": { message: MessageModel };
  "MESSAGE_DELETED": { messageId: string };
  "USER_TYPING": { from: string };
  "ERROR": { error: string };
  // Add other events here...
}

/**
 * OUTGOING ACTIONS: What the Client SENDS to Backend.
 * These match the payload structure expected by your Hono/Bun backend handlers.
 */
export interface WebSocketEmitMap {
  "SEND_MESSAGE": { conversationId: string; content: string; toUserId: string; tempId: string };
  "EDIT_MESSAGE": { messageId: string; newContent: string; toUserId: string };
  "REACT_MESSAGE": { messageId: string; reactionType: string; toUserId: string };
  "DELETE_MESSAGE": { messageId: string; toUserId: string };
  "TYPING": { toUserId: string };
}

// Type aliases for keys
export type WSEventType = keyof WebSocketEventMap;
export type WSEmitType = keyof WebSocketEmitMap;

// Strict handler type for public consumption
type WSHandler<K extends WSEventType> = (payload: WebSocketEventMap[K]) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClose = false;

  // Internal storage uses 'unknown' to allow storing mixed function types in one Map.
  // We strictly type the input/output at the method level (subscribe/send).
  private handlers = new Map<string, Set<(data: unknown) => void>>();

  public connect() {
    const { token } = useAuthStore.getState();

    // Safety check: Don't connect without a token
    if (!token) {
      console.warn("🚫 WS: No token found. Skipping connection.");
      return;
    }

    // Prevent duplicate connections
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.isIntentionalClose = false;
    // Path matches your backend route: wsHandler at /ws/:token
    const url = `${WS_BASE}/ws/${token}`;

    console.log(`🔌 WS Connecting to: ${url}`);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("🟢 WS Connected");
      // Clear any pending reconnect timers so we don't double-connect
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        // Backend sends flat JSON: { type: "EVENT_NAME", ...restOfPayload }
        // We separate 'type' to find the handler, and pass 'restOfPayload' to the component.
        const { type, ...payload } = parsed;

        if (this.handlers.has(type)) {
          // Pass the payload to listeners.
          this.handlers.get(type)?.forEach((handler) => handler(payload));
        }
      } catch (err) {
        console.warn("WS received invalid message:", event.data, err);
      }
    };

    this.socket.onclose = (event) => {
      if (this.isIntentionalClose) return;

      console.log("🟠 WS Disconnected. Code:", event.code);

      // Codes 4001/4003 usually mean Auth Failed on the server side.
      // In that case, we logout the user and stop retrying.
      if (event.code === 4001 || event.code === 4003) {
        console.error("WS Auth Failed - Logging out");
        useAuthStore.getState().logout();
        return;
      }

      // Otherwise, assume network glitch and retry in 3s
      this.reconnectTimer = setTimeout(() => {
        console.log("🔄 Attempting WS Reconnect...");
        this.connect();
      }, 3000);
    };

    this.socket.onerror = (error) => {
      console.error("🔴 WS Error", error);
      this.socket?.close();
    };
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
    console.log("🛑 WS Disconnected intentionally");
  }

  /**
   * TYPE-SAFE SEND
   * Enforces that you send the correct payload for the specific event type.
   */
  public send<K extends WSEmitType>(type: K, payload: WebSocketEmitMap[K]) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Backend expects flat structure: { type, ...payload }
      this.socket.send(JSON.stringify({ type, ...payload }));
    } else {
      console.warn(`WS not connected, cannot send: ${type}`);
    }
  }

  /**
   * TYPE-SAFE SUBSCRIBE
   * Infers the callback argument type based on the event name.
   */
  public subscribe<K extends WSEventType>(type: K, handler: WSHandler<K>) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    // Cast strict handler to 'unknown' handler for internal Map storage.
    // This allows us to store different types of handlers in the same Map.
    const genericHandler = handler as unknown as (data: unknown) => void;
    
    this.handlers.get(type)?.add(genericHandler);

    // Return cleanup function for useEffect
    return () => {
      this.handlers.get(type)?.delete(genericHandler);
    };
  }
}

// Export Singleton Instance
export const ws = new WebSocketService();
