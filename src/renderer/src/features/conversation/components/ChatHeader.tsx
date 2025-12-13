// src/features/conversation/components/ChatHeader.tsx

import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { router } from "@/routes";
import { getInitials } from "@/lib/utils";
import { apiGet, ws } from "@/lib/api";
import { useEffect, useState } from "react";

interface ChatHeaderProps {
  conversationId: string;
}

// Simple type for what we need in the header
interface ConversationHeaderInfo {
  name: string;
  avatar: string | null;
  status: string; // "online" | "offline" | etc.
}

export function ChatHeader({ conversationId }: ChatHeaderProps) {
  const [info, setInfo] = useState<ConversationHeaderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Fetch conversation details (name, avatar, opponent status)
  useEffect(() => {
    const fetchInfo = async () => {
      setIsLoading(true);
      try {
        // Adjust endpoint to match your backend
        const data = await apiGet<{
          name: string;
          avatar: string | null;
          // Add status if backend provides it
          status?: string;
          // participants array if you need to derive opponent
        }>(`/conversation/${conversationId}`);

        setInfo({
          name: data.name || "Chat",
          avatar: data.avatar || null,
          status: data.status || "offline", // fallback if not provided yet
        });
      } catch (err) {
        console.error("Failed to load conversation header info:", err);
        setInfo({ name: "Chat", avatar: null, status: "offline" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [conversationId]);

  useEffect(() => {
    const unsubscribe = ws.subscribe("USER_TYPING", (payload) => {
      // payload is { from: userId } or whatever backend sends
      // For now: any typing event in this conversation = show indicator
      // (Backend can filter by conversationId server-side)
      if (payload.conversationId === conversationId) {
        setIsTyping(true);

        // Auto-hide after 2s of silence
        const timeout = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  // Fallback while loading
  const name = info?.name || "Loading...";
  const avatar = info?.avatar;
  const status = info?.status || "offline";

  return (
    <header className="h-16 border-b flex items-center px-4 justify-between bg-card/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.history.back()}
          className="shrink-0 -ml-2"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* User Info */}
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

      {/* Actions */}
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
