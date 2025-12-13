// src/features/conversation/components/MessageItem.tsx

import React from "react";
import { Check, CheckCheck, Clock } from "lucide-react"; // Removed Trash2 for now (no failed state yet)
import { cn } from "@/lib/utils";
import { UIMessage } from "@/types";

interface MessageItemProps {
  message: UIMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const textContent = message.content?.content || "";
  const isMine = message.isMine;

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
    ? "bg-orange-500 text-white rounded-br-md"
    : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-md";

  return (
    <div
      className={cn("flex px-4 py-1", isMine ? "justify-end" : "justify-start")}
    >
      <div className="relative max-w-[75%]">
        {/* MESSAGE BUBBLE */}
        <div className={cn("rounded-2xl px-3 py-2 shadow-sm", bubbleColor)}>
          {/* SENDER NAME (in group chats — future) */}
          {!isMine && message.senderName && (
            <p className="text-xs font-semibold mb-1 text-orange-600 dark:text-orange-400">
              {message.senderName}
            </p>
          )}

          {/* CONTENT */}
          <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>

          {/* REACTIONS (future) */}
          {message.reaction && message.reaction.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {message.reaction.map((r, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5"
                >
                  {r.type === "like"
                    ? "👍"
                    : r.type === "heart"
                      ? "❤️"
                      : r.type}
                </span>
              ))}
            </div>
          )}

          {/* FOOTER: Time + Status */}
          <div className="flex items-center justify-end gap-1 mt-1 opacity-80">
            <span
              className={cn(
                "text-[10px]",
                isMine ? "text-white/90" : "text-gray-500 dark:text-gray-400",
              )}
            >
              {formatTime(message.createdAt)}
            </span>

            {isMine && (
              <span
                className={cn(
                  message.status === "read" ? "text-blue-500" : "text-white/90",
                )}
              >
                {getStatusIcon()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
