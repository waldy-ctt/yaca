// src/features/conversation/components/MessageList.tsx

import React, { useEffect, useState, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { UIMessage, MessageModel } from "@/types";
import { ws } from "@/lib/api";
import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Enrich backend message with UI data
  const enrichMessage = (msg: MessageModel): UIMessage => ({
    ...msg,
    isMine: msg.senderId === user?.id,
    status: "sent" as const, // default for fetched messages
  });

  // 1. Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<MessageModel[]>(
          `/message/conversation/${conversationId}?limit=50`
        );
        // Backend likely newest first → reverse to chronological
        setMessages(data.reverse().map(enrichMessage));
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // 2. Real-time: new messages from others
  useEffect(() => {
    const unsubscribe = ws.subscribe("NEW_MESSAGE", (payload) => {
      const { message }: { message: MessageModel } = payload;

      if (message.conversationId !== conversationId) return;

      setMessages((prev) => [...prev, enrichMessage(message)]);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // 3. Real-time: ACK for our sent messages (optimistic → confirmed)
  useEffect(() => {
    const unsubscribe = ws.subscribe("ACK", ({ tempId, message }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...enrichMessage(message), status: "sent" } : m
        )
      );
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground opacity-50">
        <p className="text-sm">No messages yet.</p>
        <p className="text-xs">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-background/50">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={scrollRef} className="h-px" />
    </div>
  );
}
