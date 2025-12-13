// src/renderer/src/features/conversationList/hooks/useConversationList.ts

import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ConversationDto, ConversationModel, presence_status } from "@/types";
import { useEffect, useState } from "react";
import { ws } from "@/lib/api";
import { MessageModel } from "@/types";

export function useConversationList() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Map raw DTO → UI model
  const mapToModel = (dto: ConversationDto): ConversationModel => ({
    id: dto.id,
    isPinned: false,
    isRead: false,
    lastMessage: dto.lastMessage,
    lastMessageTime: dto.lastMessageTimestamp,
    participants: dto.participants,
    avatar: dto.avatar,
    name: dto.name,
    status: dto.status || presence_status.OFFLINE, // ✅ Preserve status from backend
    unreadMessageAmount: 0,
  });

  // Initial fetch
  useEffect(() => {
    if (!user?.id) return;

    const fetchList = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<ConversationDto[]>(
          `/conversations/user/${user.id}`,
        );
        setConversations(data.map(mapToModel));
        setUnreadCounts({});
      } catch (e) {
        console.error("Failed to load conversations", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [user?.id]);

  // ✅ NEW: Listen for status changes
  useEffect(() => {
    const unsubscribe = ws.subscribe("STATUS_CHANGE", (payload) => {
      const { userId, status } = payload;
      
      console.log(`📡 ConversationList received STATUS_CHANGE: User ${userId} is now ${status}`);
      
      setConversations((prev) =>
        prev.map((conv) => {
          // Only update if this is a 1-on-1 conversation with the user who changed status
          if (conv.participants.length === 2 && conv.participants.includes(userId)) {
            console.log(`✅ Updating conversation ${conv.id} status to ${status}`);
            return { ...conv, status: status as presence_status };
          }
          return conv;
        })
      );
    });

    return unsubscribe;
  }, []);

  // Real-time: last message + unread count
  useEffect(() => {
    const unsubscribe = ws.subscribe("NEW_MESSAGE", (payload) => {
      const { message }: { message: MessageModel } = payload;

      if (!user || message.senderId === user.id) return;

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === message.conversationId);

        if (existing) {
          return prev.map((c) =>
            c.id === message.conversationId
              ? {
                  ...c,
                  lastMessage: JSON.stringify(message.content),
                  lastMessageTime: message.createdAt,
                }
              : c,
          );
        }

        const refetch = async () => {
          try {
            const data = await apiGet<ConversationDto[]>(
              `/conversations/user/${user.id}`,
            );
            setConversations(data.map(mapToModel));
            setUnreadCounts({});
          } catch {
            // Ignore
          }
        };
        refetch();
        return prev;
      });

      setUnreadCounts((prev) => ({
        ...prev,
        [message.conversationId]: (prev[message.conversationId] || 0) + 1,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const markAsRead = (conversationId: string) => {
    // Reset unread count when conversation is opened
  };

  return {
    isLoading,
    conversations,
    unreadCounts,
    markAsRead,
  };
}
