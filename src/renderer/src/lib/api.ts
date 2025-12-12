// src/renderer/src/lib/api.ts
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/routes";

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

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

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T | null> {
  const { token, logout } = useAuthStore.getState();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  // Auto logout on 401
  if (res.status === 401) {
    logout();
    router.navigate({ to: "/login" });
    throw new ApiError(JSON.parse(await res.text())["error"], 401);
  }

  if (!res.ok) {
    const error = await res.text();
    throw new ApiError(error || res.statusText, res.status);
  }

  // Return JSON or nothing
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Helper methods
export const apiGet = (url: string) => api(url, { method: "GET" });
export const apiPost = (url: string, body?: null | object) =>
  api(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });
export const apiPut = (url: string, body?: null | object) =>
  api(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
export const apiDelete = (url: string) => api(url, { method: "DELETE" });

// -------------------------------------------------------------------------
// WEBSOCKET MANAGER
// -------------------------------------------------------------------------

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private isIntentionalClose = false;

  public connect() {
    const { token } = useAuthStore.getState();

    if (!token) {
      console.warn("🚫 WS: No token found. Skipping connection.");
      return;
    }

    // If already connected, do nothing.
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.isIntentionalClose = false;

    // 1. UPDATED PATH LOGIC: /ws/:token
    const url = `${WS_BASE}/ws/${token}`;

    console.log(`🔌 WS Connecting to: ${url}`);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("🟢 WS Connected");
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, payload } = parsed;
        if (this.handlers.has(type)) {
          this.handlers.get(type)?.forEach((handler) => handler(payload));
        }
      } catch (err) {
        console.warn("WS received non-JSON message:", event.data);
      }
    };

    this.socket.onclose = (event) => {
      if (this.isIntentionalClose) return;

      console.log("🟠 WS Disconnected. Code:", event.code);

      // 4001/4003: Auth failed. Logout user and kill retry loop.
      if (event.code === 4001 || event.code === 4003) {
        console.error("WS Auth Failed - Logging out");
        useAuthStore.getState().logout();
        return;
      }

      this.reconnectTimer = setTimeout(() => {
        console.log("🔄 Attempting WS Reconnect...");
        this.connect();
      }, 3000); // Retry every 3s
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

  // ... [subscribe and send methods remain the same] ...
  public send(type: string, payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WS not connected, cannot send message");
    }
  }

  public subscribe(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }
}

export const ws = new WebSocketService();
