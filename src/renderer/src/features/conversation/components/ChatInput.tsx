// src/features/conversation/components/ChatInput.tsx

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ws, apiPost } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ConversationDto, ROUTES } from "@/types";
import { router } from "@/routes";

interface ChatInputProps {
  conversationId: string;
  recipientId?: string; // For draft conversations
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  conversationId,
  recipientId,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  const TYPING_DELAY = 1000;
  const isDraft = conversationId === "new";

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendTyping = (isTyping: boolean) => {
    // Only send typing indicator for real conversations
    if (!isDraft && isTyping) {
      // Backend expects: { type: "TYPING", conversationId }
      // It will broadcast to other participants automatically
      ws.send("TYPING", { conversationId });
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || disabled || isSending) return;
    if (!user?.id) return;

    const tempId = crypto.randomUUID();
    setIsSending(true);

    try {
      if (isDraft) {
        if (!recipientId) {
          console.error("Cannot send: recipientId missing for draft");
          return;
        }

        const res = await apiPost<ConversationDto>("/conversation", {
          recipientId,
          content: trimmed,
          participants: [user.id, recipientId],
          senderId: user.id,
          type: "text",
        });

        if (res && res.id) {
          // Clear input
          setMessage("");

          // Navigate to real conversation
          await router.navigate({
            to: `${ROUTES.CONVERSATION}/$conversationId`,
            params: { conversationId: res.id },
            replace: true,
          });
        }
      } else {
        // Backend only needs conversationId, content, and tempId
        // It will handle participant lookup and broadcasting
        ws.send("SEND_MESSAGE", {
          content: {
            data: message,
            type: "text", // TODO: If need to make img
          },
          destinationId: conversationId,
          destinationType: "conversation",
          tempId: tempId
        });

        setMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Only send typing indicator for real conversations
    if (isDraft) return;

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
          disabled={disabled || isSending}
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
            disabled={disabled || isSending}
            className="pr-10 h-11 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
          />

          {/* Emoji Picker Trigger */}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            disabled={disabled || isSending}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          size="icon"
          className="shrink-0 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-sm"
        >
          <Send className="w-5 h-5 text-primary-foreground ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
