import { useState, useEffect, useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { ws, apiGet, apiPost, apiDelete } from "@/lib/api";
import {
  ConversationModel,
  UIMessage,
  MessageDto,
  ConversationDto,
  presence_status,
  ROUTES,
} from "@/types"; // Import UIMessage!
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/routes";

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

  const mapConversationDtoToConversationModel = (
    raw: ConversationDto,
  ): ConversationModel => {
    return {
      lastMessage: raw.lastMessage,
      avatar: raw.avatar,
      id: raw.id,
      isPinned: false,
      isRead: false,
      lastMessageTime: raw.lastMessageTimestamp,
      participants: raw.participants,
      name: raw.name,
      status: presence_status.NONE,
      unreadMessageAmount: 0,
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
  // 3. SEND MESSAGE (The "Draft -> Real" Fix)
  // ----------------------------------------------------------------
  const sendMessage = async (content: string) => {
    if (!user?.id) return;

    // 1. Identify Recipient
    // If it's a new draft, we use the URL param. If it's real, we find the "other" participant.
    const targetUserId =
      conversationId === "new"
        ? draftRecipientId
        : conversation?.participants?.find((p) => p !== user.id) || "";

    if (!targetUserId) {
      console.error("Cannot send: Target user ID missing");
      return;
    }

    const tempId = Date.now().toString();

    // 2. Optimistic Update (Show message instantly)
    const optimisticMsg: UIMessage = {
      id: tempId,
      content: { content: content, type: "text" },
      createdAt: new Date().toISOString(),
      isPinned: false,
      isRead: true,
      participants: [user.id, targetUserId], // Add if your model requires it

      senderId: user.id,
      isMine: true,
      conversationId: conversationId,
      reaction: [],
      status: "sending",
      senderName: user.name || "Me",
      senderAvatar: user.avatar || undefined,
    } as unknown as UIMessage;

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(
      () => scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      10,
    );

    try {
      if (conversationId === "new") {
        // CASE A: NEW CONVERSATION (HTTP)
        const res = await apiPost<ConversationDto>("/conversation", {
          recipientId: targetUserId,
          content,
          participants: [user.id, targetUserId],
          senderId: user.id,
          type: "text",
        });

        if (res && res.id) {
          await router.navigate({
            to: `${ROUTES.CONVERSATION}/$conversationId`,
            params: { conversationId: res.id },
            replace: true, // Replaces "new" in history so Back button works naturally
          });
          return res.id;
        }
      } else {
        // CASE B: EXISTING CONVERSATION (WebSocket)
        ws.send("SEND_MESSAGE", {
          conversationId,
          content,
          toUserId: targetUserId,
          tempId,
        });
      }
    } catch (e) {
      console.error("Send failed", e);
      // Mark message as failed in UI
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
    }
  };

  const deleteConversation = async (conversationId: string) => {
    const res = await apiDelete<boolean>(`/conversation/${conversationId}`);
    if (res) {
      setConversation(null);
      router.navigate({ to: ROUTES.HOME });
    }
  };

  return {
    messages,
    conversation,
    isLoading,
    sendMessage,
    scrollToBottomRef,
    deleteConversation,
  };
}
