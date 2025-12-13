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

  // ← NEW: Track unread count per conversation
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Map raw DTO → UI model
  const mapToModel = (dto: ConversationDto): ConversationModel => ({
    id: dto.id,
    isPinned: false,
    isRead: false, // legacy — we'll ignore this now
    lastMessage: dto.lastMessage,
    lastMessageTime: dto.lastMessageTimestamp,
    participants: dto.participants,
    avatar: dto.avatar,
    name: dto.name,
    status: presence_status.NONE,
    unreadMessageAmount: 0, // we'll override via unreadCounts
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
        // Reset unread on fresh load (simple & safe)
        setUnreadCounts({});
      } catch (e) {
        console.error("Failed to load conversations", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [user?.id]);

  // Real-time: last message + unread count
  useEffect(() => {
    const unsubscribe = ws.subscribe("NEW_MESSAGE", (payload) => {
      const { message }: { message: MessageModel } = payload;

      // Ignore own messages
      if (!user || message.senderId === user.id) return;

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === message.conversationId);

        if (existing) {
          // Update existing conversation
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

        // New conversation appeared → refetch full list
        const refetch = async () => {
          try {
            const data = await apiGet<ConversationDto[]>(
              `/conversations/user/${user.id}`,
            );
            setConversations(data.map(mapToModel));
            setUnreadCounts({}); // reset on full refresh
          } catch {
            // Ignore
          }
        };
        refetch();
        return prev;
      });

      // ← NEW: Increment unread count for this conversation
      setUnreadCounts((prev) => ({
        ...prev,
        [message.conversationId]: (prev[message.conversationId] || 0) + 1,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // ← NEW: Function to mark a conversation as read
  const markAsRead = (conversationId: string) => {
    // setUnreadCounts((prev) => ({
    //   ...prev,
    //   [conversationId]: 0,
    // }));
  };

  return {
    isLoading,
    conversations,
    unreadCounts, // ← expose for ConversationItem
    markAsRead, // ← call from ConversationScreen
  };
}
