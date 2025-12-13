// src/renderer/src/features/conversationList/conversationList.tsx

import { useIsMobile } from "@/hooks/use-mobile";
import { useMatch } from "@tanstack/react-router";
import ConversationScreen from "../conversation/ConversationScreen";
import ConversationList from "./ConversationList";

function EmptyChatPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <p className="text-center px-8">
        Select a conversation to start chatting
      </p>
    </div>
  );
}

export default function ConversationListScreen() {
  const isMobile = useIsMobile();

  const conversationMatch = useMatch({
    from: "/conversation/$conversationId",
    shouldThrow: false,
  });
  const conversationId = conversationMatch?.params.conversationId;

  // Mobile: single view
  if (isMobile) {
    return conversationId ? <ConversationScreen /> : <ConversationList />;
  }

  // Desktop: split view
  return (
    <div className="flex h-screen bg-background">
      {/* Left: Conversation List */}
      <div className="w-96 border-r border-border flex flex-col">
        <ConversationList />  
      </div>

      {/* Right: Chat or Placeholder */}
      <div className="flex-1">
        {conversationId ? <ConversationScreen /> : <EmptyChatPlaceholder />}
      </div>
    </div>
  );
}
