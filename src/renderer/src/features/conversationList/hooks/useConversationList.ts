import { apiGet } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ConversationDto, ConversationModel, presence_status } from "@/types";
import { useEffect, useState } from "react";

export function useConversationList() {
  const { user, token } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentUserConversationList, setCurrentUserConversationList] = useState<ConversationModel[]>([]);

  const mapToConversationModel = (raw: ConversationDto): ConversationModel => {
    return {
      id: raw.id,
      isPinned: false,
      isRead: false,
      lastMessage: raw.lastMessage,
      lastMessageTime: raw.lastMessageTimestamp,
      participants: raw.participants,
      avatar: raw.avatar,
      name: raw.name,
      status: presence_status.NONE,
      unreadMessageAmount: 0,
    };
  };

  useEffect(() => {
    const fetchConversationList = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<ConversationDto[]>(`/conversation/user/${user?.id}`);
        
        setCurrentUserConversationList(data.map(mapToConversationModel))

      } catch (e) {
        console.error("Failed to load conversation list data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationList();
  }, [user?.id]);

  return {
    isLoading,
    currentUserConversationList
  };
}
