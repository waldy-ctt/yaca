import { useParams, useSearch } from "@tanstack/react-router";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { useConversationList } from "../conversationList/hooks/useConversationList";
import { useEffect } from "react";
import { ws } from "@/lib/api";

function ConversationScreen() {
  const { conversationId } = useParams({
    from: "/conversation/$conversationId",
  });
  const searchParams = useSearch({ strict: false }) as { recipientId?: string };
  const { markAsRead } = useConversationList();

  useEffect(() => {
    // Only mark as read for real conversations (not drafts)
    if (!conversationId || conversationId === "new") return;

    markAsRead(conversationId);
    ws.send("READ", { conversationId });
  }, [conversationId, markAsRead]);

  // For draft conversations, we need recipientId from search params
  const isDraft = conversationId === "new";
  const recipientId = isDraft ? searchParams.recipientId : undefined;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={conversationId} recipientId={recipientId} />
      <MessageList conversationId={conversationId} />
      <ChatInput conversationId={conversationId} recipientId={recipientId} />
    </div>
  );
}

export default ConversationScreen;
