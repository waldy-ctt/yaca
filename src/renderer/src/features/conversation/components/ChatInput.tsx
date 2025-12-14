// src/renderer/src/features/conversation/components/ChatInput.tsx

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ws, apiPost } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ConversationDto, ROUTES, UIMessage } from "@/types";
import { router } from "@/routes";

interface ChatInputProps {
  conversationId: string;
  recipientId?: string;
  disabled?: boolean;
  placeholder?: string;
  onOptimisticMessage?: (message: UIMessage) => void;
}

export function ChatInput({
  conversationId,
  recipientId,
  disabled = false,
  placeholder = "Type a message...",
  onOptimisticMessage,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const { user } = useAuthStore();

  const TYPING_DELAY = 2000;
  const isDraft = conversationId === "new";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendTyping = () => {
    if (isDraft) return;
    
    if (!isTypingRef.current) {
      console.log("⌨️ Sending TYPING event for conversation:", conversationId);
      ws.send("TYPING", { conversationId });
      isTypingRef.current = true;
    }
  };

  const stopTyping = () => {
    if (isTypingRef.current) {
      console.log("🛑 Stopping typing indicator");
      isTypingRef.current = false;
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || disabled || isSending) return;
    if (!user?.id) return;

    stopTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);

    // ✅ Generate tempId for optimistic message
    const tempId = crypto.randomUUID();
    setIsSending(true);

    try {
      if (isDraft) {
        if (!recipientId) {
          console.error("Cannot send: recipientId missing for draft");
          return;
        }

        const res = await apiPost<ConversationDto>("/conversations", {
          recipientId,
          content: trimmed,
          participants: [user.id, recipientId],
          senderId: user.id,
          type: "text",
        });

        if (res && res.id) {
          setMessage("");
          await router.navigate({
            to: `${ROUTES.CONVERSATION}/$conversationId`,
            params: { conversationId: res.id },
            replace: true,
          });
        }
      } else {
        // ✅ Create optimistic message with tempId
        const optimisticMsg: UIMessage = {
          id: tempId, // ✅ This matches the tempId sent to backend
          content: { content: trimmed, type: "text" },
          conversationId,
          senderId: user.id,
          createdAt: new Date().toISOString(),
          reaction: [],
          isMine: true,
          status: "sending", // ✅ Start as "sending"
        };

        console.log("📝 Creating optimistic message:");
        console.log("   tempId:", tempId);
        console.log("   conversationId:", conversationId);
        console.log("   status:", optimisticMsg.status);

        // Add to UI immediately
        if (onOptimisticMessage) {
          onOptimisticMessage(optimisticMsg);
        }

        // Clear input
        setMessage("");

        // ✅ Send via WebSocket with tempId
        const wsPayload = {
          destinationId: conversationId,
          destinationType: "conversation",
          content: {
            data: trimmed,
            type: "text",
          },
          tempId: tempId, // ✅ Backend will echo this back in ACK
        };
        
        console.log("📤 Sending via WebSocket:", wsPayload);
        ws.send("SEND_MESSAGE", wsPayload);
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

    if (isDraft) return;

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    if (value.trim()) {
      sendTyping();
      
      typingTimer.current = setTimeout(() => {
        stopTyping();
      }, TYPING_DELAY);
    } else {
      stopTyping();
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
      stopTyping();
    };
  }, []);

  return (
    <div className="bg-background border-t p-3 md:p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled || isSending}
        >
          <Plus className="w-5 h-5" />
        </Button>

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

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            disabled={disabled || isSending}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

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
