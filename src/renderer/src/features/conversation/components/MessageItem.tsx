import React from "react";
import { Check, CheckCheck, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UIMessage } from "@/types";

interface MessageItemProps {
  message: UIMessage;
  // Selection Mode Props
  selectionMode: boolean;
  isSelected: boolean;
  // Handlers
  onPress: () => void;
  onLongPress: () => void;
  onToggleSelect: () => void;
}

export function MessageItem({
  message,
  selectionMode,
  isSelected,
  onPress,
  onLongPress,
  onToggleSelect,
}: MessageItemProps) {
  
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
        return <Clock className="w-3 h-3" />;
      case "sent":
        return <Check className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case "failed":
        return <Trash2 className="w-3 h-3 text-red-500" />; 
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect();
    } else {
      onPress();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectionMode) {
      onLongPress();
    }
  };

  const bubbleColor = isMine
    ? "bg-orange-500 text-white rounded-br-md"
    : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-md";

  return (
    <div
      className={cn(
        "flex px-4 py-1",
        isMine ? "justify-end" : "justify-start"
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className={cn("relative max-w-[75%]", selectionMode && "pr-10")}>
        
        {/* CHECKBOX (Selection Mode) */}
        {selectionMode && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2">
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-orange-500 border-orange-500"
                  : "border-gray-400"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}

        {/* MESSAGE BUBBLE */}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 transition-all shadow-sm",
            bubbleColor,
            isSelected && "ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-gray-900"
          )}
        >
          {/* SENDER NAME (Group Chats) */}
          {!isMine && message.senderId && (
            // You might want to map senderId to a name via a store or prop if senderName isn't on the model
            <p className="text-xs font-semibold mb-1 text-orange-600 dark:text-orange-400">
              {message.name || "User"} 
            </p>
          )}

          {/* CONTENT */}
          <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>

          {/* REACTIONS */}
          {message.reaction && message.reaction.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {message.reaction.map((r, idx) => (
                <span
                  key={`${r.sender}-${idx}`}
                  className="text-[10px] bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5"
                >
                  {/* Map reaction type 'like' to emoji if needed */}
                  {r.type === 'like' ? '👍' : r.type === 'heart' ? '❤️' : r.type}
                </span>
              ))}
            </div>
          )}

          {/* FOOTER (Time & Status) */}
          <div className="flex items-center justify-end gap-1 mt-1 opacity-80">
            <span className={cn(
              "text-[10px]",
              isMine ? "text-white/90" : "text-gray-500 dark:text-gray-400"
            )}>
              {formatTime(message.createdAt)}
            </span>
            
            {isMine && (
              <span className={cn(
                message.status === "read" ? "text-blue-200" : "text-white/90"
              )}>
                {getStatusIcon()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
