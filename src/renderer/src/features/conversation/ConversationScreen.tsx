import { useParams, useSearch } from "@tanstack/react-router";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { useConversationList } from "../conversationList/hooks/useConversationList";
import { useEffect, useState } from "react";
import { ws } from "@/lib/api";
import { UIMessage } from "@/types";

function ConversationScreen() {
  const { conversationId } = useParams({
    from: "/conversation/$conversationId",
  });
  const searchParams = useSearch({ strict: false }) as { recipientId?: string };
  const { markAsRead } = useConversationList();
  
  // State to hold the optimistic message handler
  const [addOptimisticMessage, setAddOptimisticMessage] = useState<
    ((msg: UIMessage) => void) | null
  >(null);

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
        onOptimisticMessageHandler={setAddOptimisticMessage}
      />
      
      <ChatInput
        conversationId={conversationId}
        recipientId={recipientId}
        onOptimisticMessage={addOptimisticMessage || undefined}
      />
    </div>
  );
}

export default ConversationScreen;
