// src/renderer/src/features/conversationList/ConversationListScreen.tsx

import { useIsMobile } from "@/hooks/use-mobile";
import { useMatch } from "@tanstack/react-router";
import ConversationScreen from "../conversation/ConversationScreen";
import ConversationList from "./ConversationList";

function EmptyChatPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          Select a conversation
        </h3>
        <p className="text-sm">
          Choose a conversation from the list to start chatting, or create a new one
        </p>
      </div>
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

  // ✅ Mobile: single view (show list OR chat)
  if (isMobile) {
    return conversationId ? <ConversationScreen /> : <ConversationList />;
  }

  // ✅ Desktop: split view (list on left, chat on right)
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left: Conversation List - Always visible on desktop */}
      <div className="w-96 border-r border-border flex flex-col shrink-0 bg-card">
        <ConversationList />
      </div>

      {/* Right: Chat or Placeholder */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {conversationId ? <ConversationScreen /> : <EmptyChatPlaceholder />}
      </div>
    </div>
  );
}
