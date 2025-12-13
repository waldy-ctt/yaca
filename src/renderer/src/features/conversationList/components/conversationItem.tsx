import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Pin, Image as ImageIcon } from "lucide-react"; // Added ImageIcon

interface ConversationProps {
  name: string;
  lastMessage: string; // This is the JSON string
  isPinned: boolean;
  isRead: boolean;
  latestTimestamp: string | Date; // Relaxed type to allow Date objects too
  opponentAvatar: string | null;
  onClick?: () => void;
}

export function ConversationItem({
  name,
  lastMessage,
  isPinned,
  isRead,
  latestTimestamp,
  opponentAvatar,
  onClick,
}: ConversationProps) {
  
  // 1. PARSE MESSAGE CONTENT
  const messagePreview = useMemo(() => {
    try {
      // Attempt to parse the JSON string: '{"content": "...", "type": "..."}'
      const parsed = JSON.parse(lastMessage);
      
      // Handle different message types
      if (parsed.type === "image") {
        return (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Sent an image
          </span>
        );
      }
      
      // Default: Return the text content
      return parsed.content;
    } catch (e) {
      // Fallback: If it's not JSON, display as-is (e.g. "Started a conversation")
      return lastMessage;
    }
  }, [lastMessage]);

  // 2. FORMAT TIME
  const formattedTime = (() => {
    const now = new Date();
    const messageDate = new Date(latestTimestamp);

    const isToday =
      now.getDate() === messageDate.getDate() &&
      now.getMonth() === messageDate.getMonth() &&
      now.getFullYear() === messageDate.getFullYear();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return messageDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
    }
  })();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 p-2.5 px-3 cursor-pointer",
        "hover:bg-accent/50 transition-colors",
        isPinned && "bg-muted/30",
      )}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={opponentAvatar || ""} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-0.5">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-base text-foreground truncate">
            {name}
          </span>
          <span
            className={cn(
              "text-xs ml-2 shrink-0",
              !isRead ? "text-primary font-medium" : "text-muted-foreground",
            )}
          >
            {formattedTime}
          </span>
        </div>

        <div className="flex justify-between items-center">
          {/* 3. USE PARSED PREVIEW HERE */}
          <div className={cn("text-sm truncate pr-2 flex-1", "text-muted-foreground")}>
            {messagePreview}
          </div>

          <div className="flex items-center gap-2 shrink-0 h-5">
            {isPinned && (
              <Pin className="h-3.5 w-3.5 fill-muted-foreground text-muted-foreground -rotate-45" />
            )}

            {!isRead && (
              <div className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">1</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
