import { useParams } from "@tanstack/react-router";
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
  const { markAsRead } = useConversationList();

  useEffect(() => {
    if (!conversationId) return;

    markAsRead(conversationId);

    ws.send("READ", { conversationId });
  }, [conversationId]);

  // Now conversationId is ALWAYS defined and real
  if (!conversationId || conversationId === "new") {
    // Safety net — should never happen now
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invalid conversation
      </div>
    );
  }

  // Pass conversationId directly to hooks/components
  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={conversationId} />
      <MessageList conversationId={conversationId} />
      <ChatInput conversationId={conversationId} />
    </div>
  );
}

export default ConversationScreen;
