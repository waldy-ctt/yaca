// src/renderer/src/lib/api.ts

import { useAuthStore } from "@/stores/authStore";
import { MessageModel } from "@/types";
import { router } from "@/routes";

const API_BASE = import.meta.env.VITE_API_URL;
const WS_BASE = API_BASE.replace(/^http/, "ws");

// REST API
class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { token, logout } = useAuthStore.getState();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    logout();
    router.navigate({ to: "/login" });
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }

  if (res.status === 204) return {} as T;
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const apiGet = <T>(url: string) => api<T>(url, { method: "GET" });
export const apiPost = <T, B = unknown>(url: string, body?: B) =>
  api<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });
export const apiPut = <T, B = unknown>(url: string, body?: B) =>
  api<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
export const apiDelete = <T>(url: string) => api<T>(url, { method: "DELETE" });

// WEBSOCKET
export interface WebSocketEventMap {
  NEW_MESSAGE: { message: MessageModel };
  ACK: { tempId: string; message: MessageModel };
  MESSAGE_UPDATED: { message: MessageModel };
  MESSAGE_DELETED: { messageId: string };
  USER_TYPING: { conversationId: string };
  READ: { conversationId: string; readerId: string };
  STATUS_CHANGE: { userId: string; status: "online" | "offline" | "sleep" | "dnd" };
  ERROR: { error: string };
}

export interface WebSocketEmitMap {
  SEND_MESSAGE: {
    content: { data: string; type: "text" | "image" };
    destinationId: string;
    destinationType: "conversation" | "user";
    tempId: string;
  };
  TYPING: { conversationId: string };
  READ: { conversationId: string };
}

export type WSEventType = keyof WebSocketEventMap;
export type WSEmitType = keyof WebSocketEmitMap;
type WSHandler<K extends WSEventType> = (payload: WebSocketEventMap[K]) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<(data: unknown) => void>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  public getSocket() {
    return this.socket;
  }

  public connect() {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("✅ Already connected");
      return;
    }

    const url = `${WS_BASE}/ws/${token}`;
    console.log("🔌 Connecting to:", url);
    
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("✅✅✅ WEBSOCKET CONNECTED ✅✅✅");
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, ...payload } = parsed;
        console.log("📨 RECEIVED:", type, payload);
        this.handlers.get(type)?.forEach((handler) => handler(payload));
      } catch (e) {
        console.error("Parse error:", e);
      }
    };

    this.socket.onclose = (event) => {
      console.log("❌ DISCONNECTED. Code:", event.code);
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (e) => {
      console.error("❌ WS ERROR:", e);
    };
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  public send<K extends WSEmitType>(type: K, payload: WebSocketEmitMap[K]) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("❌❌❌ CANNOT SEND - NOT CONNECTED ❌❌❌");
      console.log("Socket:", this.socket);
      console.log("ReadyState:", this.socket?.readyState);
      return;
    }
    
    const message = { type, ...payload };
    console.log("📤 SENDING:", type, payload);
    this.socket.send(JSON.stringify(message));
    console.log("✅ SENT SUCCESSFULLY");
  }

  public subscribe<K extends WSEventType>(type: K, handler: WSHandler<K>) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    const generic = handler as (data: unknown) => void;
    this.handlers.get(type)?.add(generic);
    return () => this.handlers.get(type)?.delete(generic);
  }
}

export const ws = new WebSocketService();
