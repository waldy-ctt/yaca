// src/renderer/src/features/conversationList/hooks/useConversationList.ts

import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ConversationDto, ConversationModel, presence_status } from "@/types";
import { useEffect, useState, useCallback } from "react";
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
    status: dto.status || presence_status.OFFLINE,
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
        console.log("📋 [useConversationList] Loaded conversations:", data.length);
      } catch (e) {
        console.error("Failed to load conversations", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [user?.id]);

  // Listen for status changes
  useEffect(() => {
    const unsubscribe = ws.subscribe("STATUS_CHANGE", (payload) => {
      const { userId, status } = payload;
      
      console.log(`📡 ConversationList received STATUS_CHANGE: User ${userId} is now ${status}`);
      
      setConversations((prev) =>
        prev.map((conv) => {
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

      console.log("📨 [useConversationList] NEW_MESSAGE received:", message.id);
      console.log("   From:", message.senderId, "Current user:", user?.id);

      if (!user || message.senderId === user.id) {
        console.log("   ⏭️ Skipping: message is from current user");
        return;
      }

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === message.conversationId);

        if (existing) {
          console.log(`   ✅ Updating conversation ${message.conversationId}`);
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

        console.log("   🔄 Conversation not found, refetching...");
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

      console.log(`   📊 Incrementing unread count for ${message.conversationId}`);
      setUnreadCounts((prev) => {
        const newCount = (prev[message.conversationId] || 0) + 1;
        console.log(`   New unread count: ${newCount}`);
        return {
          ...prev,
          [message.conversationId]: newCount,
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Listen for READ events
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = ws.subscribe("READ", (payload) => {
      const { conversationId, readerId } = payload;
      
      console.log(`📖 [useConversationList] READ event received:`, payload);
      console.log(`   Reader: ${readerId}, Current user: ${user.id}`);
      
      // Only clear if current user read it
      if (readerId === user.id) {
        console.log(`   ✅ Clearing unread count for ${conversationId}`);
        setUnreadCounts((prev) => {
          const updated = { ...prev };
          const oldCount = updated[conversationId];
          delete updated[conversationId];
          console.log(`   Count changed from ${oldCount} to 0`);
          return updated;
        });
      } else {
        console.log(`   ⏭️ Skipping: not current user's read event`);
      }
    });

    return unsubscribe;
  }, [user?.id]);

  const markAsRead = useCallback((conversationId: string) => {
    console.log(`✅ [markAsRead] Called for ${conversationId}`);
    console.log(`   Current unread counts:`, unreadCounts);
    
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      const oldCount = updated[conversationId];
      delete updated[conversationId];
      
      console.log(`   Cleared unread count (was ${oldCount})`);
      console.log(`   New unread counts:`, updated);
      return updated;
    });
  }, [unreadCounts]);

  return {
    isLoading,
    conversations,
    unreadCounts,
    markAsRead,
  };
}
