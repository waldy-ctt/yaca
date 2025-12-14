// src/renderer/src/features/conversation/ConversationScreen.tsx

import { useParams, useSearch } from "@tanstack/react-router";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { useConversationList } from "../conversationList/hooks/useConversationList";
import { useEffect, useRef } from "react";
import { ws } from "@/lib/api";
import { UIMessage } from "@/types";
import { ChatInput } from "./components/ChatInput";

function ConversationScreen() {
  const { conversationId } = useParams({
    from: "/conversation/$conversationId",
  });
  const searchParams = useSearch({ strict: false }) as { recipientId?: string };
  const { markAsRead } = useConversationList();
  
  const addOptimisticMessageRef = useRef<((msg: UIMessage) => void) | null>(null);

  // ✅ Mark as read whenever conversation changes
  useEffect(() => {
    if (!conversationId || conversationId === "new") return;

    markAsRead(conversationId);
    ws.send("READ", { conversationId });
  }, [conversationId, markAsRead]);

  const isDraft = conversationId === "new";
  const recipientId = isDraft ? searchParams.recipientId : undefined;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={conversationId} recipientId={recipientId} />
      
      <MessageList
        conversationId={conversationId}
        onOptimisticMessageHandler={(handler) => {
          addOptimisticMessageRef.current = handler;
        }}
      />
      
      <ChatInput
        conversationId={conversationId}
        recipientId={recipientId}
        onOptimisticMessage={addOptimisticMessageRef.current || undefined}
      />
    </div>
  );
}

export default ConversationScreen;
