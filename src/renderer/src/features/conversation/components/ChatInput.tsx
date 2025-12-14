// src/renderer/src/features/conversation/components/ChatInput.tsx
// DELETE EVERYTHING IN THIS FILE AND PASTE THIS

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ws } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { UIMessage } from "@/types";

interface ChatInputProps {
  conversationId: string;
  recipientId?: string;
  onOptimisticMessage?: (message: UIMessage) => void;
}

export function ChatInput({
  conversationId,
  onOptimisticMessage,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const handleSend = () => {
    const text = message.trim();
    if (!text || !user?.id) return;

    console.log("🚀🚀🚀 BUTTON CLICKED 🚀🚀🚀");
    console.log("Message:", text);
    console.log("ConversationId:", conversationId);
    console.log("UserId:", user.id);

    const tempId = `temp_${Date.now()}`;
    
    // Add optimistic message
    if (onOptimisticMessage) {
      console.log("➕ Adding optimistic message");
      const optimisticMsg: UIMessage = {
        id: tempId,
        content: { content: text, type: "text" },
        conversationId,
        senderId: user.id,
        createdAt: new Date().toISOString(),
        reaction: [],
        isMine: true,
        status: "sending",
      };
      onOptimisticMessage(optimisticMsg);
    }

    // Clear input
    setMessage("");

    // Send via WebSocket
    console.log("📤 Calling ws.send...");
    ws.send("SEND_MESSAGE", {
      destinationId: conversationId,
      destinationType: "conversation",
      content: {
        data: text,
        type: "text",
      },
      tempId: tempId,
    });
    
    console.log("✅ ws.send() completed");
  };

  return (
    <div className="bg-background border-t p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
