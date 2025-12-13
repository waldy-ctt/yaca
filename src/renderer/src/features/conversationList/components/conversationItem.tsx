// src/features/conversationList/components/conversationItem.tsx

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Pin, Image as ImageIcon } from "lucide-react";
import { presence_status } from "@/types";

interface ConversationProps {
  name: string;
  lastMessage: string;
  isPinned: boolean;
  latestTimestamp: string | Date;
  opponentAvatar: string | null;
  unreadCount?: number;
  onClick?: () => void;
  // ✅ NEW: Props for status
  participantCount?: number;
  opponentStatus?: presence_status;
}

export function ConversationItem({
  name,
  lastMessage,
  isPinned,
  latestTimestamp,
  opponentAvatar,
  unreadCount = 0,
  onClick,
  participantCount = 2,
  opponentStatus,
}: ConversationProps) {
  
  // Parse message preview (handles both JSON and plain text)
  const messagePreview = useMemo(() => {
    if (!lastMessage) return "No messages yet";
    
    try {
      const parsed = JSON.parse(lastMessage);
      
      if (parsed.type === "image") {
        return (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Image
          </span>
        );
      }
      
      return parsed.content || "Message";
    } catch {
      return lastMessage;
    }
  }, [lastMessage]);

  // Format time
  const formattedTime = (() => {
    if (!latestTimestamp) return "";
    
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
    return messageDate.toLocaleDateString("en-CA");
  })();

  const hasUnread = unreadCount > 0;
  const is1on1 = participantCount === 2;

  // ✅ Get status indicator color
  const getStatusColor = () => {
    switch (opponentStatus) {
      case presence_status.ONLINE:
        return "bg-green-500";
      case presence_status.SLEEP:
        return "bg-yellow-500";
      case presence_status.DND:
        return "bg-red-500";
      case presence_status.OFFLINE:
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 p-2.5 px-3 cursor-pointer",
        "hover:bg-accent/50 transition-colors",
        isPinned && "bg-muted/30",
        hasUnread && "font-medium"
      )}
    >
      {/* Avatar with Status Indicator */}
      <div className="relative">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={opponentAvatar || ""} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        {/* ✅ Status Indicator - Only show for 1-on-1 chats */}
        {is1on1 && (
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background bg-background flex items-center justify-center">
            <div className={cn("w-2.5 h-2.5 rounded-full", getStatusColor())} />
          </div>
        )}
      </div>

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
