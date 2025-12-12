import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { UIMessage } from "@/types";
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
      <div
        onClick={() => {
          setIsUserSheetOpen(true);
        }}
        className="cursor-pointer"
      >
        <ChatHeader
          conversation={conversation}
          // draftName={draftUser?.name}
          // draftAvatar={draftUser?.avatar}
          // draftStatus={draftUser?.status}
          draftName={""}
          draftAvatar={""}
          draftStatus={""}
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
      <ChatInput onSend={sendMessage} disabled={isLoading} />

      {/* --- OVERLAYS --- */}

      {/* 1. Message Details (Reactions, Copy, Delete) */}
      <MessageDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        message={selectedMessage}
        onReaction={(emoji) => {
          console.log("TODO: React with", emoji, "to", selectedMessage?.id);
          // Implement ws.send("REACT_MESSAGE", ...) in useChat later
        }}
        onDelete={() => {
          console.log("TODO: Delete message", selectedMessage?.id);
          // Implement ws.send("DELETE_MESSAGE", ...) in useChat later
        }}
      />

      {/* 2. User/Group Info Side Sheet */}
      <UserSideSheet
        isOpen={isUserSheetOpen}
        onClose={() => setIsUserSheetOpen(false)}
        // Pass either the full conversation or just the draft user info
        data={conversation}
      />
    </div>
  );
}

export default ConversationScreen;
