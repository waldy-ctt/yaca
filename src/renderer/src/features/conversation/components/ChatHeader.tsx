// src/features/conversation/components/ChatHeader.tsx

import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { router } from "@/routes";
import { getInitials } from "@/lib/utils";
import { apiGet, ws } from "@/lib/api";
import { useEffect, useState } from "react";
import { presence_status, UserModel } from "@/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface ChatHeaderProps {
  conversationId: string;
  recipientId?: string;
}

interface ConversationHeaderInfo {
  name: string;
  avatar: string | null;
  status: presence_status;
  participantCount: number;
  opponentId?: string;
}

export function ChatHeader({ conversationId, recipientId }: ChatHeaderProps) {
  const { user } = useAuthStore();
  const [info, setInfo] = useState<ConversationHeaderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const isDraft = conversationId === "new";
  const is1on1 = info?.participantCount === 2;

  // ✅ Fetch initial conversation info
  useEffect(() => {
    const fetchInfo = async () => {
      setIsLoading(true);
      try {
        if (isDraft && recipientId) {
          const userData = await apiGet<UserModel>(`/users/${recipientId}`);
          console.log("📱 Draft - Fetched user:", userData);

          setInfo({
            name: userData.name || "User",
            avatar: userData.avatar,
            status: userData.status || presence_status.OFFLINE,
            participantCount: 2,
            opponentId: recipientId,
          });
        } else if (!isDraft) {
          const data = await apiGet<{
            name: string;
            avatar: string | null;
            status?: presence_status;
            participants: string[];
          }>(`/conversations/${conversationId}`);
          
          console.log("📱 Real conversation - Fetched data:", data);

          // ✅ FIX: Find the opponent's ID correctly
          const opponentId = data.participants?.find(id => id !== user?.id);
          
          setInfo({
            name: data.name || "Chat",
            avatar: data.avatar || null,
            status: data.status || presence_status.OFFLINE,
            participantCount: data.participants?.length || 2,
            opponentId: opponentId,
          });
        }
      } catch (err) {
        console.error("Failed to load conversation header info:", err);
        setInfo({ 
          name: "Chat", 
          avatar: null, 
          status: presence_status.OFFLINE,
          participantCount: 2 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [conversationId, recipientId, isDraft, user?.id]);

  // ✅ Listen for real-time status changes
  useEffect(() => {
    if (!info?.opponentId || !is1on1) return;

    console.log("👂 ChatHeader listening for status changes for opponent:", info.opponentId);

    const unsubscribe = ws.subscribe("STATUS_CHANGE", (payload) => {
      console.log("📡 ChatHeader received STATUS_CHANGE:", payload);
      
      if (payload.userId === info.opponentId) {
        console.log("✅ ChatHeader updating opponent status to:", payload.status);
        setInfo(prev => prev ? {
          ...prev,
          status: payload.status as presence_status
        } : null);
      }
    });

    return unsubscribe;
  }, [info?.opponentId, is1on1]);

  // ✅ Listen for typing events
  useEffect(() => {
    if (isDraft) return;

    const unsubscribe = ws.subscribe("USER_TYPING", (payload) => {
      console.log("⌨️ Received USER_TYPING:", payload);
      
      if (payload.conversationId === conversationId || payload.from === info?.opponentId) {
        setIsTyping(true);
        const timeout = setTimeout(() => setIsTyping(false), 3000);
        return () => clearTimeout(timeout);
      }
    });

    return unsubscribe;
  }, [conversationId, isDraft, info?.opponentId]);

  // ✅ Get status indicator color
  const getStatusColor = () => {
    if (!is1on1) return "bg-gray-400";
    
    switch (info?.status) {
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

  const name = info?.name || "Loading...";
  const avatar = info?.avatar;
  const status = info?.status || presence_status.OFFLINE;

  console.log("🎨 Rendering header with:", { name, status, is1on1, opponentId: info?.opponentId });

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
          <div className="relative">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={avatar || ""} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            
            {is1on1 && (
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background bg-background flex items-center justify-center">
                <div className={cn("w-2.5 h-2.5 rounded-full", getStatusColor())} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-sm font-semibold leading-none">{name}</h2>
            {isLoading ? (
              <p className="text-xs text-muted-foreground mt-1">Loading...</p>
            ) : isTyping ? (
              // ✅ Enhanced typing indicator
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-primary italic">typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            ) : is1on1 ? (
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {status}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                {info?.participantCount} participants
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
