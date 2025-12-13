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
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-2">Start a new one!</p>
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
              opponentStatus={(conv as any).status}
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
