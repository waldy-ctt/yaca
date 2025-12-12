import { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  disabled = false,
  placeholder = "Type a message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount (optional, good for UX)
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSend(message);
    setMessage("");
    
    // Keep focus after sending
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-background border-t p-3 md:p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        
        {/* Attachment Button (Placeholder for future feature) */}
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
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="pr-10 h-11 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
          />
          
          {/* Emoji Button (Inside Input) */}
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            disabled={disabled}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="shrink-0 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-primary-foreground ml-0.5" /> 
          {/* ml-0.5 centers the icon visually since the paper plane is slightly off-center */}
        </Button>
      </div>
    </div>
  );
}
