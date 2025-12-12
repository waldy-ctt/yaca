import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

// The Hooks & Components we built
import { useChat } from "./hooks/useChat";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";
// (You'll need to create a simple Header component similarly, or inline it for now)

function ConversationScreen() {
  // 1. Logic
  const { conversationId } = useParams({ from: '/conversation/$conversationId' });
  const { messages, isLoading, sendMessage, scrollToBottomRef } = useChat(conversationId);

  // 2. Local UI State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 3. Handlers (That connect UI to Logic)
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    if (next.size === 0) setSelectionMode(false);
  };

  if (isLoading && conversationId !== 'new') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* HEADER (Simplify or extract this later) */}
      <header className="h-16 border-b flex items-center px-4 shrink-0">
        <h1 className="font-bold text-lg">
           {/* TODO: Add proper header with user info from useChat() */}
           Chat
        </h1>
      </header>

      {/* MESSAGE LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(msg.id)}
            onPress={() => console.log("Pressed", msg.id)}
            onLongPress={() => {
              setSelectionMode(true);
              setSelectedIds(new Set([msg.id]));
            }}
            onToggleSelect={() => handleToggleSelect(msg.id)}
          />
        ))}
        {/* Invisible div to scroll to */}
        <div ref={scrollToBottomRef} />
      </div>

      {/* INPUT AREA */}
      <ChatInput onSend={sendMessage} />
      
    </div>
  );
}

export default ConversationScreen;
