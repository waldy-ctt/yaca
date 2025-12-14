// src/renderer/src/features/conversation/components/MessageList.tsx

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageItem } from "./MessageItem";
import { UIMessage, MessageModel, MessageDto } from "@/types";
import { ws } from "@/lib/api";
import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { MessageDetailSheet } from "./MessageDetailSheet";

interface MessageListProps {
  conversationId: string;
  onOptimisticMessageHandler?: (handler: (msg: UIMessage) => void) => void;
}

export function MessageList({
  conversationId,
  onOptimisticMessageHandler,
}: MessageListProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<UIMessage | null>(
    null,
  );
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const enrichMessage = (msg: MessageModel): UIMessage => ({
    ...msg,
    isMine: msg.senderId === user?.id,
    status: "sent" as const,
  });

  const addOptimisticMessage = useCallback((msg: UIMessage) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(
      () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
      10,
    );
  }, []);

  useEffect(() => {
    if (onOptimisticMessageHandler) {
      onOptimisticMessageHandler(addOptimisticMessage);
    }
  }, [onOptimisticMessageHandler, addOptimisticMessage]);

  // Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      if (conversationId === "new") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiGet<MessageDto>(
          `/messages/conversations/${conversationId}?limit=50`,
        );
        setMessages(data.data.reverse().map(enrichMessage));
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // WebSocket: ACK handler
  useEffect(() => {
    const unsubscribe = ws.subscribe("ACK", ({ tempId, message }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...enrichMessage(message), status: "sent" as const }
            : m,
        ),
      );
    });

    return () => {
      unsubscribe;
    };
  }, [user?.id]);

  // WebSocket: NEW_MESSAGE
  useEffect(() => {
    if (conversationId === "new") return;

    const unsubscribe = ws.subscribe("NEW_MESSAGE", (payload) => {
      const msg = payload.message;

      if (msg.conversationId !== conversationId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;

        const enrichedMsg = enrichMessage(msg);

        setTimeout(
          () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
          10,
        );

        return [...prev, enrichedMsg];
      });
    });

    return () => {
      unsubscribe;
    };
  }, [conversationId, user?.id]);

  // WebSocket: READ event
  useEffect(() => {
    if (conversationId === "new") return;

    const unsubscribe = ws.subscribe("READ", ({ conversationId: cid }) => {
      if (cid !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user?.id ? { ...m, status: "read" as const } : m,
        ),
      );
    });

    return () => {
      unsubscribe;
    };
  }, [conversationId, user?.id]);

  // ✅ NEW: WebSocket - MESSAGE_UPDATED (reactions)
  useEffect(() => {
    if (conversationId === "new") return;

    const unsubscribe = ws.subscribe("MESSAGE_UPDATED", (payload) => {
      const updatedMsg = payload.message;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === updatedMsg.id ? enrichMessage(updatedMsg) : m,
        ),
      );
    });

    return () => {
      unsubscribe;
    };
  }, [conversationId, user?.id]);

  // ✅ NEW: WebSocket - MESSAGE_DELETED
  useEffect(() => {
    if (conversationId === "new") return;

    const unsubscribe = ws.subscribe("MESSAGE_DELETED", (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
    });

    return () => {
      unsubscribe;
    };
  }, [conversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ NEW: Handle message click
  const handleMessageClick = (message: UIMessage) => {
    setSelectedMessage(message);
    setIsDetailSheetOpen(true);
  };

  // ✅ NEW: Handle message deletion
  const handleMessageDelete = () => {
    if (selectedMessage) {
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    }
  };

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
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-background/50">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onClick={() => handleMessageClick(msg)}
          />
        ))}
        <div ref={scrollRef} className="h-px" />
      </div>

      <MessageDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        message={selectedMessage}
        onDelete={handleMessageDelete}
      />
    </>
  );
}
