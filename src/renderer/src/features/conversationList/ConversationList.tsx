// src/renderer/src/features/conversationList/ConversationList.tsx

import { router } from "@/routes";
import ListHeader from "./components/ListHeader";
import { ConversationItem } from "./components/conversationItem";
import { useConversationList } from "./hooks/useConversationList";

export default function ConversationList() {
  const { isLoading, conversations, unreadCounts } = useConversationList();
  

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ListHeader />

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 px-4">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-2">Start a new one to get chatting!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              name={conv.name ?? "Unknown"}
              lastMessage={conv.lastMessage}
              isPinned={conv.isPinned}
              latestTimestamp={conv.lastMessageTime}
              opponentAvatar={conv.avatar}
              unreadCount={unreadCounts[conv.id] || 0}
              participantCount={conv.participants?.length || 2}
              opponentStatus={conv.status}
              onClick={() =>
                router.navigate({
                  to: "/conversation/$conversationId",
                  params: { conversationId: conv.id },
                })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
