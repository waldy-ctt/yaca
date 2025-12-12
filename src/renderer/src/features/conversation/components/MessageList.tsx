import React from "react";
import { MessageItem } from "./MessageItem";
import { UIMessage } from "@/types";

interface MessageListProps {
  messages: UIMessage[];
  selectionMode: boolean;
  selectedIds: Set<string>;
  onPress: (message: UIMessage) => void;
  onLongPress: (id: string) => void;
  onToggleSelect: (id: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  selectionMode,
  selectedIds,
  onPress,
  onLongPress,
  onToggleSelect,
  scrollRef,
}: MessageListProps) {
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground opacity-50">
        <p className="text-sm">No messages yet.</p>
        <p className="text-xs">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-background/50">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          selectionMode={selectionMode}
          isSelected={selectedIds.has(msg.id)}
          onPress={() => onPress(msg)}
          onLongPress={() => onLongPress(msg.id)}
          onToggleSelect={() => onToggleSelect(msg.id)}
        />
      ))}
      
      {/* Scroll Anchor */}
      <div ref={scrollRef} className="h-px" />
    </div>
  );
}
