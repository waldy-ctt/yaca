/* eslint-disable @typescript-eslint/no-explicit-any */
// src/renderer/src/features/conversation/components/MessageList.tsx

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageItem } from "./MessageItem";
import { apiGet, ws } from "@/lib/api";
import { MessageDto, UIMessage, MessageModel } from "@/types";
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
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<UIMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraft = conversationId === "new";

  // Map backend message to UI message
  const mapToUIMessage = useCallback((raw: MessageModel): UIMessage => ({
    id: raw.id,
    content: raw.content,
    conversationId: raw.conversationId,
    createdAt: raw.createdAt,
    reaction: raw.reaction,
    senderId: raw.senderId,
    senderName: (raw as any).senderName,
    senderAvatar: (raw as any).senderAvatar,
    isMine: raw.senderId === user?.id,
    status: "read",
  }), [user?.id]);

  // ✅ Expose handler for optimistic messages
  useEffect(() => {
    if (onOptimisticMessageHandler) {
      onOptimisticMessageHandler((msg: UIMessage) => {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => scrollToBottom(), 50);
      });
    }
  }, [onOptimisticMessageHandler]);

  // Initial load
  useEffect(() => {
    if (isDraft) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<MessageDto>(
          `/messages/conversation/${conversationId}`
        );
        
        if (isMounted) {
          setMessages(data.data.map(mapToUIMessage).reverse());
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [conversationId, isDraft, mapToUIMessage]);

  // WebSocket listeners
  useEffect(() => {
    if (isDraft) return;

    // ✅ NEW_MESSAGE: Add new messages
    const unsubscribeNew = ws.subscribe("NEW_MESSAGE", (payload) => {
      const rawMsg = payload.message as MessageModel;

      if (rawMsg.conversationId === conversationId) {
        const uiMsg = mapToUIMessage(rawMsg);

        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === uiMsg.id)) return prev;
          return [...prev, uiMsg];
        });

        setTimeout(() => scrollToBottom(), 100);
      }
    });

    // ✅ ACK: Update optimistic message with real ID
    const unsubscribeAck = ws.subscribe("ACK", (payload) => {
      if (payload.message?.conversationId === conversationId) {
        setMessages((prev) => {
          return prev.map((m) => {
            // Match by tempId (the optimistic message ID)
            if (m.id === payload.tempId) {
              return {
                ...m,
                id: payload.message.id,
                status: "sent",
                createdAt: payload.message.createdAt,
              };
            }
            return m;
          });
        });
      }
    });

    // ✅ MESSAGE_UPDATED: Handle reactions and edits
    const unsubscribeUpdate = ws.subscribe("MESSAGE_UPDATED", (payload) => {
      const updatedMessage = payload.message as MessageModel;

      if (updatedMessage.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === updatedMessage.id
              ? {
                  ...m,
                  reaction: updatedMessage.reaction,
                  content: updatedMessage.content,
                  updatedAt: updatedMessage.updatedAt,
                }
              : m
          )
        );
      }
    });

    // ✅ MESSAGE_DELETED: Remove deleted messages
    const unsubscribeDelete = ws.subscribe("MESSAGE_DELETED", (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
    });

    return () => {
      unsubscribeNew();
      unsubscribeAck();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [conversationId, isDraft, mapToUIMessage]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleDeleteMessage = useCallback(() => {
    if (!selectedMessage) return;
    setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    setSelectedMessage(null);
  }, [selectedMessage]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onClick={() => setSelectedMessage(msg)}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      <MessageDetailSheet
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
        onDelete={handleDeleteMessage}
      />
    </>
  );
}
