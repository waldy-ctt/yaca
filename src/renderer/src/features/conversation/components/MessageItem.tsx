// src/features/conversation/components/MessageItem.tsx

import { useMemo } from "react";
import { Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UIMessage } from "@/types";
import { useAuthStore } from "@/stores/authStore";

interface MessageItemProps {
  message: UIMessage;
  onClick?: () => void;
}

export function MessageItem({ message, onClick }: MessageItemProps) {
  const { user } = useAuthStore();
  const textContent = message.content?.content || "";
  const isMine = message.isMine;

  // ✅ Group reactions by type
  const groupedReactions = useMemo(() => {
    const groups = new Map<
      string,
      { count: number; hasUserReacted: boolean; emoji: string }
    >();

    message.reaction?.forEach((r) => {
      const existing = groups.get(r.type) || {
        count: 0,
        hasUserReacted: false,
        emoji: "",
      };

      existing.count++;
      if (r.sender === user?.id) {
        existing.hasUserReacted = true;
      }

      // Set emoji
      if (r.type === "like") existing.emoji = "👍";
      else if (r.type === "heart") existing.emoji = "❤️";
      else if (r.type === "laugh") existing.emoji = "😂";

      groups.set(r.type, existing);
    });

    return Array.from(groups.entries());
  }, [message.reaction, user?.id]);

  const formatTime = (date?: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="w-3 h-3 animate-pulse" />;
      case "sent":
        return <Check className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const bubbleColor = isMine
    ? "bg-primary text-primary-foreground rounded-br-md"
    : "bg-secondary text-secondary-foreground rounded-bl-md";

  return (
    <div
      className={cn("flex px-4 py-1", isMine ? "justify-end" : "justify-start")}
      onClick={onClick}
    >
      <div className="relative max-w-[75%] cursor-pointer group">
        {/* MESSAGE BUBBLE */}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 shadow-sm transition-all",
            "group-hover:shadow-md group-active:scale-[0.98]",
            bubbleColor,
          )}
        >
          {/* SENDER NAME (in group chats) */}
          {!isMine && message.senderName && (
            <p className="text-xs font-semibold mb-1 opacity-80">
              {message.senderName}
            </p>
          )}

          {/* CONTENT */}
          <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>

          {/* FOOTER: Time + Status */}
          <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
            <span className="text-[10px]">{formatTime(message.createdAt)}</span>

            {isMine && (
              <span
                className={cn(message.status === "read" ? "text-blue-500" : "")}
              >
                {getStatusIcon()}
              </span>
            )}
          </div>
        </div>

        {/* ✅ GROUPED REACTIONS - Outside bubble */}
        {groupedReactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {groupedReactions.map(([type, data]) => (
              <span
                key={type}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full border flex items-center gap-1",
                  "bg-background/90 backdrop-blur-sm shadow-sm",
                  data.hasUserReacted
                    ? "border-primary/50 ring-1 ring-primary/20"
                    : "border-border",
                )}
              >
                <span>{data.emoji}</span>
                <span className="font-medium">{data.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
