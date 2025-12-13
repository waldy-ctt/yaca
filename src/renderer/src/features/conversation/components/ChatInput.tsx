// src/features/conversation/components/ChatInput.tsx

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ws } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface ChatInputProps {
  conversationId: string;
  disabled?: boolean; // optional, for future loading states
  placeholder?: string;
}

export function ChatInput({
  conversationId,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  const TYPING_DELAY = 1000;

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendTyping = (isTyping: boolean) => {
    if (isTyping) {
      ws.send("TYPING", { conversationId }); // backend knows exactly which chat
    }
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    // Send via WebSocket directly
    ws.send("SEND_MESSAGE", {
      conversationId,
      content: trimmed,
      // toUserId: we'll improve this later with participant lookup
      // For now, backend can infer from conversation
      toUserId: "",
      tempId: crypto.randomUUID(), // optimistic UI key
    });

    setMessage("");
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Clear previous timer
    if (typingTimer.current) clearTimeout(typingTimer.current);

    if (value.trim()) {
      sendTyping(true);
      typingTimer.current = setTimeout(() => sendTyping(false), TYPING_DELAY);
    } else {
      sendTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  return (
    <div className="bg-background border-t p-3 md:p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        {/* Attachment Button (future feature) */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Plus className="w-5 h-5" />
        </Button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="pr-10 h-11 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
          />

          {/* Emoji Picker Trigger */}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            disabled={disabled}
            // onClick={openEmojiPicker} // future
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="shrink-0 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-sm"
        >
          <Send className="w-5 h-5 text-primary-foreground ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
