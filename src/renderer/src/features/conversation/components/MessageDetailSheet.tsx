// src/features/conversation/components/MessageDetailSheet.tsx

import { useMemo, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Reply, Trash2, Clock, Check, CheckCheck } from "lucide-react";
import { UIMessage } from "@/types";
import { apiPost, apiDelete, apiGet } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface MessageDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message: UIMessage | null;
  onDelete: () => void;
}

const REACTIONS = [
  { emoji: "👍", type: "like" },
  { emoji: "❤️", type: "heart" },
  { emoji: "😂", type: "laugh" },
];

export function MessageDetailSheet({
  isOpen,
  onClose,
  message,
  onDelete,
}: MessageDetailSheetProps) {
  const { user } = useAuthStore();
  const [isReacting, setIsReacting] = useState(false);
  const [reactionUsers, setReactionUsers] = useState<Record<string, string[]>>({});

  // ✅ Fetch user names for reactions
  useEffect(() => {
    if (!message || !message.reaction || message.reaction.length === 0) {
      setReactionUsers({});
      return;
    }

    const fetchUsers = async () => {
      const userMap: Record<string, string[]> = {};

      for (const reaction of message.reaction) {
        if (!userMap[reaction.type]) {
          userMap[reaction.type] = [];
        }

        // Fetch user name
        try {
          const userData = await apiGet<any>(`/users/${reaction.sender}`);
          userMap[reaction.type].push(userData.name || "Unknown");
        } catch (e) {
          userMap[reaction.type].push("Unknown");
        }
      }

      setReactionUsers(userMap);
    };

    fetchUsers();
  }, [message?.reaction]);

  // ✅ Group reactions by type with counts
  const groupedReactions = useMemo(() => {
    if (!message?.reaction) return [];

    const groups = new Map<string, { 
      count: number; 
      hasUserReacted: boolean; 
      emoji: string;
      users: string[];
    }>();

    message.reaction.forEach((r) => {
      const existing = groups.get(r.type) || { 
        count: 0, 
        hasUserReacted: false, 
        emoji: "",
        users: []
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
  }, [message?.reaction, user?.id]);

  if (!message) return null;

  const handleReaction = async (reactionType: string) => {
    if (isReacting) return;
    
    setIsReacting(true);
    try {
      await apiPost(`/messages/${message.id}/reactions`, { reactionType });
      onClose();
    } catch (error) {
      console.error("Failed to add reaction:", error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content.content);
    onClose();
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/messages/${message.id}`);
      onDelete();
      onClose();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const formatTime = (date?: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="w-4 h-4 animate-pulse text-muted-foreground" />;
      case "sent":
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Message Details</SheetTitle>
          <SheetDescription className="sr-only">
            Actions and information for the selected message
          </SheetDescription>
        </SheetHeader>

        {/* Message Preview */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6 border">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={message.senderAvatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(message.senderName || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{message.senderName || "You"}</p>
              <p className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</p>
            </div>
            {message.isMine && getStatusIcon()}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content.content}</p>
        </div>

        {/* ✅ IMPROVED: Show grouped reactions with names */}
        {groupedReactions.length > 0 && (
          <>
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Reactions</h4>
              <div className="space-y-2">
                {groupedReactions.map(([type, data]) => (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      data.hasUserReacted 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{data.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">
                          {data.count} {data.count === 1 ? "reaction" : "reactions"}
                        </p>
                        {reactionUsers[type] && (
                          <p className="text-xs text-muted-foreground">
                            {reactionUsers[type].join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {data.hasUserReacted && (
                      <span className="text-xs text-primary font-medium">
                        You reacted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator className="mb-6" />
          </>
        )}

        {/* Quick Reactions */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium">Quick Reactions</h4>
          <div className="flex gap-2 flex-wrap">
            {REACTIONS.map(({ emoji, type }) => {
              const hasReacted = groupedReactions.some(
                ([t, data]) => t === type && data.hasUserReacted
              );

              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  disabled={isReacting}
                  className={cn(
                    "text-3xl hover:scale-125 transition-all active:scale-95",
                    "rounded-xl p-3 w-16 h-16 flex items-center justify-center",
                    "disabled:opacity-50 border-2",
                    hasReacted 
                      ? "bg-primary/10 border-primary shadow-md" 
                      : "bg-secondary/50 hover:bg-secondary border-transparent"
                  )}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Tap again to remove your reaction
          </p>
        </div>

        <Separator className="mb-6" />

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
            Copy Text
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 hidden"
          >
            <Reply className="w-4 h-4" />
            Reply
          </Button>

          {message.isMine && (
            <Button 
              variant="destructive" 
              className="w-full justify-start gap-3 h-12 mt-4"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete Message
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
