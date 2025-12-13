// src/features/conversation/components/ChatHeader.tsx

import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { router } from "@/routes";
import { getInitials } from "@/lib/utils";
import { apiGet, ws } from "@/lib/api";
import { useEffect, useState } from "react";
import { presence_status, UserDto, UserModel } from "@/types";

interface ChatHeaderProps {
  conversationId: string;
  recipientId?: string; // For draft conversations
}

interface ConversationHeaderInfo {
  name: string;
  avatar: string | null;
  status: string;
}

export function ChatHeader({ conversationId, recipientId }: ChatHeaderProps) {
  const [info, setInfo] = useState<ConversationHeaderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const isDraft = conversationId === "new";

  useEffect(() => {
    const fetchInfo = async () => {
      setIsLoading(true);
      try {
        if (isDraft && recipientId) {
          const userData = await apiGet<UserModel>(`/users/${recipientId}`);

          setInfo({
            name: userData.name || "User",
            avatar: userData.avatar,
            status: userData.status || presence_status.OFFLINE,
          });
        } else if (!isDraft) {
          const data = await apiGet<{
            name: string;
            avatar: string | null;
            status?: string;
          }>(`/conversations/${conversationId}`);

          setInfo({
            name: data.name || "Chat",
            avatar: data.avatar || null,
            status: data.status || "offline",
          });
        }
      } catch (err) {
        console.error("Failed to load conversation header info:", err);
        setInfo({ name: "Chat", avatar: null, status: "offline" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [conversationId, recipientId, isDraft]);

  useEffect(() => {
    // Only subscribe to typing events for real conversations
    if (isDraft) return;

    const unsubscribe = ws.subscribe("USER_TYPING", (payload) => {
      if (payload.conversationId === conversationId) {
        setIsTyping(true);
        const timeout = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, isDraft]);

  const name = info?.name || "Loading...";
  const avatar = info?.avatar;
  const status = info?.status || "offline";

  return (
    <header className="h-16 border-b flex items-center px-4 justify-between bg-card/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.history.back()}
          className="shrink-0 -ml-2"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={avatar || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-center">
            <h2 className="text-sm font-semibold leading-none">{name}</h2>
            {isLoading ? (
              <p className="text-xs text-muted-foreground mt-1">Loading...</p>
            ) : isTyping ? (
              <p className="text-xs text-primary italic mt-1">typing...</p>
            ) : (
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {status}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <Phone className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <Video className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
