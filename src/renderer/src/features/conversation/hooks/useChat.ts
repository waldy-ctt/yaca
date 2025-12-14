import { useState, useEffect, useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { ws, apiGet, apiPost, apiDelete } from "@/lib/api";
import {
  ConversationModel,
  UIMessage,
  MessageDto,
  ConversationDto,
  ROUTES,
  MessageModel,
} from "@/types";
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

  // Map backend message to UI message
  const mapToUIMessage = (raw: SingleDtoItem | MessageModel): UIMessage => {
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

  // Initial load - skip for new conversations
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
          apiGet<ConversationModel>(`/conversations/${conversationId}`),
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
  }, [conversationId, user?.id]);

  // WebSocket subscriptions - skip for new conversations
  useEffect(() => {
    if (conversationId === "new") return;

    const unsubscribeNew = ws.subscribe("NEW_MESSAGE", (payload) => {
      const rawMsg = payload.message as MessageModel;

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

  // Send message function
  const sendMessage = async (content: string) => {
    if (!user?.id) return;

    const targetUserId =
      conversationId === "new"
        ? draftRecipientId
        : conversation?.participants?.find((p) => p !== user.id) || "";

    if (!targetUserId) {
      console.error("Cannot send: Target user ID missing");
      return;
    }

    const tempId = Date.now().toString();

    // Optimistic UI update
    const optimisticMsg: UIMessage = {
      id: tempId,
      content: { content: content, type: "text" },
      createdAt: new Date().toISOString(),
      senderId: user.id,
      isMine: true,
      conversationId: conversationId,
      reaction: [],
      status: "sending",
    } as UIMessage;

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(
      () => scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      10,
    );

    try {
      if (conversationId === "new") {
        const res = await apiPost<ConversationDto>("/conversations", {
          recipientId: targetUserId,
          content,
          participants: [user.id, targetUserId],
          senderId: user.id,
          type: "text",
        });

        if (res && res.id) {
          // Navigate to the real conversation
          await router.navigate({
            to: `${ROUTES.CONVERSATION}/$conversationId`,
            params: { conversationId: res.id },
            replace: true,
          });

          // Update local state
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, status: "sent", id: res.id } : m,
            ),
          );
        }
      } else {
        // EXISTING CONVERSATION: Send via WebSocket
        ws.send("SEND_MESSAGE", {
          destinationId: conversationId,
          content: { data: content, type: "text" },
          destinationType: 'conversation',
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

  const deleteConversation = async (conversationId: string) => {
    const res = await apiDelete<boolean>(`/conversations/${conversationId}`);
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
