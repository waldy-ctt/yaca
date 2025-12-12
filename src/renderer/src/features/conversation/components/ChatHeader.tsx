import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { router } from "@/routes";
import { getInitials } from "@/lib/utils";
import { ConversationModel } from "@/types";

interface ChatHeaderProps {
  conversation: ConversationModel | null;
  // Extra props for "Draft" mode when conversation is null
  draftName?: string;
  draftAvatar?: string | null;
  draftStatus?: string;
}

export function ChatHeader({ 
  conversation, 
  draftName, 
  draftAvatar, 
  draftStatus 
}: ChatHeaderProps) {
  
  // LOGIC: Use real data if available, otherwise fallback to draft data
  const name = conversation?.name || draftName || "Chat";
  const avatar = conversation?.avatar || draftAvatar;
  const status = conversation?.status || draftStatus || "offline";

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
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={avatar || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col justify-center">
            <h2 className="text-sm font-semibold leading-none">{name}</h2>
            <p className="text-xs text-muted-foreground capitalize mt-1">
              {status}
            </p>
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
