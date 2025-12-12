import { useState, useEffect, useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { ws, apiGet, apiPost } from "@/lib/api";
import {
  MessageModel,
  ConversationModel,
  UIMessage,
  MessageDto,
} from "@/types"; // Import UIMessage!
import { useAuthStore } from "@/stores/authStore";

interface ChatSearchParams {
  recipientId?: string;
}
type SingleDtoItem = MessageDto["data"][number];
export function useChat(conversationId: string) {
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [conversation, setConversation] = useState<ConversationModel | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearch({ strict: false }) as ChatSearchParams;
  const draftRecipientId = searchParams.recipientId;
  const scrollToBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------
  // ⚡ HELPER: The "Bridge" from Raw Data to UI Data
  // ----------------------------------------------------------------
  const mapToUIMessage = (raw: SingleDtoItem): UIMessage => {
    return {
      id: raw.id,
      content: raw.content,
      conversationId: raw.conversationId,
      createdAt: raw.createdAt,
      reaction: raw.reaction,
      senderId: raw.senderId,
      isMine: raw.senderId === user?.id,
      status: "read",
    };
  };

  // ----------------------------------------------------------------
  // 1. INIT LOAD
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!conversationId || conversationId === "new") {
      setIsLoading(false);
      return;
    }

    const initChat = async () => {
      setIsLoading(true);
      try {
        const [msgsData, convData] = await Promise.all([
          apiGet<MessageDto>(`/messages/${conversationId}`),
          apiGet<ConversationModel>(`/conversation/${conversationId}`),
        ]);

        if (msgsData.data.length > 0) {
          setMessages(msgsData.data.map(mapToUIMessage));
        }
        if (convData) setConversation(convData);
      } catch (error) {
        console.error("Failed to load chat data", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [conversationId, user?.id]); // Add user.id as dependency so isMine recalculates if user changes

  // ----------------------------------------------------------------
  // 2. WEBSOCKET
  // ----------------------------------------------------------------
  useEffect(() => {
    const unsubscribeNew = ws.subscribe("NEW_MESSAGE", (payload) => {
      const rawMsg = payload.message as unknown as SingleDtoItem;

      if (rawMsg.conversationId === conversationId) {
        const uiMsg = mapToUIMessage(rawMsg);

        setMessages((prev) => {
          if (prev.some((m) => m.id === uiMsg.id)) return prev;
          return [...prev, uiMsg];
        });

        setTimeout(
          () =>
            scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }
    });

    const unsubscribeAck = ws.subscribe("ACK", (payload) => {
      if (payload.message.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.tempId
              ? { ...m, status: "sent", id: payload.message.id }
              : m,
          ),
        );
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeAck();
    };
  }, [conversationId, user?.id]);

  // ----------------------------------------------------------------
  // 3. SEND MESSAGE
  // ----------------------------------------------------------------
  const sendMessage = async (content: string) => {
    if (!user?.id) return;

    const targetUserId =
      conversationId === "new"
        ? draftRecipientId
        : conversation?.participants.find((id) => id !== user.id);

    if (!targetUserId) return;

    const tempId = Date.now().toString();

    const optimisticMsg: UIMessage = {
      id: tempId,
      content: { content: content, type: "text" },
      createdAt: new Date().toISOString(),
      isPinned: false,
      isRead: true,
      participantsIdList: [user.id, targetUserId],
      lastMessageTime: new Date(),

      senderId: user.id,
      isMine: true,
      conversationId: conversationId,
      reaction: [],
      status: "sending",
      name: user.name || "Me",
      avatar: user.avatar || "",
    } as unknown as UIMessage;

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(
      () => scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      10,
    );

    try {
      if (conversationId === "new") {
        const res = await apiPost<{ id: string }>("/conversation", {
          recipientId: targetUserId,
          content,
          type: "text",
        });
        return res?.id;
      } else {
        ws.send("SEND_MESSAGE", {
          conversationId,
          content,
          toUserId: targetUserId,
          tempId,
        });
      }
    } catch (e) {
      console.error("Send failed", e);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
    }
  };

  return {
    messages,
    conversation,
    isLoading,
    sendMessage,
    scrollToBottomRef,
  };
}
