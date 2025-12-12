import { useState, useEffect, useRef } from "react";
import { useSearch } from "@tanstack/react-router"; 
import { ws, apiGet, apiPost } from "@/lib/api";
import { MessageModel, ConversationModel, UIMessage } from "@/types"; // Import UIMessage!
import { useAuthStore } from "@/stores/authStore";

interface ChatSearchParams {
  recipientId?: string;
}

export function useChat(conversationId: string) {
  const { user } = useAuthStore();
  
  // 1. STATE: Strictly typed as UIMessage[]
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [conversation, setConversation] = useState<ConversationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearch({ strict: false }) as ChatSearchParams;
  const draftRecipientId = searchParams.recipientId;
  const scrollToBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------
  // ⚡ HELPER: The "Bridge" from Raw Data to UI Data
  // ----------------------------------------------------------------
  const mapToUIMessage = (raw: MessageModel): UIMessage => {
    return {
      ...raw,
      isMine: raw.senderId === user?.id,
      // Default status for history is 'read' (or calculate based on raw.isRead)
      status: "read" 
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
          apiGet<MessageModel[]>(`/conversation/${conversationId}/messages`),
          apiGet<ConversationModel>(`/conversation/${conversationId}`)
        ]);

        if (msgsData) {
          // ✅ FIX: Convert raw array to UI array before setting state
          setMessages(msgsData.map(mapToUIMessage));
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
      const rawMsg = payload.message;

      if (rawMsg.conversationId === conversationId) {
        // ✅ FIX: Convert raw message to UI message on the fly
        const uiMsg = mapToUIMessage(rawMsg);

        setMessages((prev) => {
          if (prev.some(m => m.id === uiMsg.id)) return prev;
          return [...prev, uiMsg];
        });

        setTimeout(() => scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });

    const unsubscribeAck = ws.subscribe("ACK", (payload) => {
       if (payload.message.conversationId === conversationId) {
          setMessages(prev => 
            prev.map(m => m.id === payload.tempId ? { ...m, status: "sent", id: payload.message.id } : m)
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

    const targetUserId = conversationId === "new" 
      ? draftRecipientId 
      : conversation?.participantsIdList.find(id => id !== user.id);

    if (!targetUserId) return;

    const tempId = Date.now().toString();

    // ✅ FIX: Create a strictly typed UIMessage
    const optimisticMsg: UIMessage = {
      id: tempId,
      content: { content: content, type: "text" }, // Match nested structure
      createdAt: new Date().toISOString(), // Match string type
      isPinned: false,
      isRead: true,
      participantsIdList: [user.id, targetUserId],
      lastMessageTime: new Date(), // If part of model
      
      senderId: user.id,
      isMine: true,       // Explicitly set true
      conversationId: conversationId,
      reaction: [],
      status: "sending",  // UI status
      name: user.name || "Me", 
      avatar: user.avatar || "",
    } as unknown as UIMessage; // Safe cast if optional fields match

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);

    try {
      if (conversationId === "new") {
        const res = await apiPost<{ id: string }>("/conversation", { 
          recipientId: targetUserId, 
          content,
          type: "text"
        });
        return res?.id;
      } else {
        ws.send("SEND_MESSAGE", {
          conversationId,
          content,
          toUserId: targetUserId,
          tempId
        });
      }
    } catch (e) {
      console.error("Send failed", e);
      setMessages(prev => prev.map(m => m.id === tempId ? {...m, status: "failed"} : m)); 
    }
  };

  return {
    messages,
    conversation,
    isLoading,
    sendMessage,
    scrollToBottomRef
  };
}
