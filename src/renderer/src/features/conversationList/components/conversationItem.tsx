// src/features/conversationList/components/conversationItem.tsx

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Pin, Image as ImageIcon } from "lucide-react";

interface ConversationProps {
  name: string;
  lastMessage: string;
  isPinned: boolean;
  // isRead: boolean;  ← REMOVE this line
  latestTimestamp: string | Date;
  opponentAvatar: string | null;
  unreadCount?: number;
  onClick?: () => void;
}

export function ConversationItem({
  name,
  lastMessage,
  isPinned,
  latestTimestamp,
  opponentAvatar,
  unreadCount = 0,       // default 0
  onClick,
}: ConversationProps) {
  
  // Parse message preview (image detection)
  const messagePreview = useMemo(() => {
    try {
      const parsed = JSON.parse(lastMessage);
      if (parsed.type === "image") {
        return (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Sent an image
          </span>
        );
      }
      return parsed.content;
    } catch {
      return lastMessage;
    }
  }, [lastMessage]);

  // Format time
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
    }
    return messageDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
  })();

  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 p-2.5 px-3 cursor-pointer",
        "hover:bg-accent/50 transition-colors",
        isPinned && "bg-muted/30",
        hasUnread && "font-medium" // bold when unread
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
          <span className={cn(
            "text-xs ml-2 shrink-0",
            hasUnread ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {formattedTime}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className={cn("text-sm truncate pr-2 flex-1", "text-muted-foreground")}>
            {messagePreview}
          </div>

          <div className="flex items-center gap-2 shrink-0 h-5">
            {isPinned && (
              <Pin className="h-3.5 w-3.5 fill-muted-foreground text-muted-foreground -rotate-45" />
            )}

            {hasUnread && (
              <div className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
