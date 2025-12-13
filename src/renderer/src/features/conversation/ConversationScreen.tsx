import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { presence_status, UIMessage } from "@/types";
import { useChat } from "./hooks/useChat";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { MessageDetailSheet } from "./components/MessageDetailSheet";
import { UserSideSheet } from "./components/UserSideSheet";

function ConversationScreen() {
  const { conversationId } = useParams({
    from: "/conversation/$conversationId",
  });

  const { messages, conversation, isLoading, sendMessage, scrollToBottomRef } =
    useChat(conversationId);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<UIMessage | null>(
    null,
  );

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setSelectedIds(next);
    if (next.size === 0) setSelectionMode(false);
  };

  const handleMessagePress = (msg: UIMessage) => {
    if (selectionMode) {
      handleToggleSelect(msg.id);
    } else {
      setSelectedMessage(msg);
      setIsDetailOpen(true);
    }
  };

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  if (isLoading && conversationId !== "new") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative">
      <div onClick={() => setIsUserSheetOpen(true)} className="cursor-pointer">
        <ChatHeader
          conversation={conversation}
          // 2. Pass draft data so the header isn't empty on new chats
          draftName={"New Chat"}
          draftAvatar={null}
          draftStatus={presence_status.NONE}
        />
      </div>

      {/* MESSAGE LIST */}
      <MessageList
        messages={messages}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onPress={handleMessagePress}
        onLongPress={handleLongPress}
        onToggleSelect={handleToggleSelect}
        scrollRef={scrollToBottomRef}
      />

      {/* INPUT AREA */}
      <ChatInput
        onSend={async (content) => {
          await sendMessage(content);
          // 3. No setConversationId needed here.
          // sendMessage handles navigation -> URL updates -> Component re-renders with new ID.
        }}
        disabled={isLoading}
      />

      {/* --- OVERLAYS --- */}

      <MessageDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        message={selectedMessage}
        onReaction={(emoji) => {
          console.log("TODO: React", emoji);
        }}
        onDelete={() => {
          console.log("TODO: Delete");
        }}
      />

      <UserSideSheet
        isOpen={isUserSheetOpen}
        onClose={() => setIsUserSheetOpen(false)}
        // Use conversation if available, otherwise fall back to draftUser
        data={conversation}
        conversationId={conversationId}
      />
    </div>
  );
}

export default ConversationScreen;
