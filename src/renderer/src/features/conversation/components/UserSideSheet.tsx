import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Delete, Phone, Video } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ConversationModel, UserModel } from "@/types";
import { useChat } from "../hooks/useChat";

interface UserSideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // Can be a full conversation OR a user profile (for drafts)
  data: ConversationModel | UserModel | null;
  conversationId: string;
}

export function UserSideSheet({ isOpen, onClose, data, conversationId }: UserSideSheetProps) {
  const { deleteConversation } = useChat(conversationId);

  if (!data) return null;


  // Normalization logic: Handle both ConversationModel and UserModel
  const name = "name" in data ? data.name : "Chat";
  const avatar = data.avatar;
  const subtitle = "status" in data ? data.status : "participants";
  const email = "email" in data ? data.email : null;
  const phone = "tel" in data ? data.tel : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-80 p-0">
        <div className="h-full flex flex-col">
          {/* Header Image / Color */}
          <div className="h-32 bg-gradient-to-b from-primary/20 to-background" />

          {/* Profile Content */}
          <div className="px-6 -mt-12 flex-1 flex flex-col gap-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-4 border-background shadow-sm mb-3">
                <AvatarImage src={avatar || ""} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(name || "?")}
                </AvatarFallback>
              </Avatar>

              <SheetTitle className="text-xl font-bold">{name}</SheetTitle>
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {subtitle}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 gap-1 hidden"
              >
                <Phone className="w-4 h-4" />
                <span className="text-[10px]">Call</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 gap-1"
                onClick={() => {deleteConversation(conversationId)}}
              >
                <Delete className="w-4 h-4" />
                <span className="text-[10px]">Delete Chat</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 gap-1"
              >
                <Video className="w-4 h-4" />
                <span className="text-[10px]">Video</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 gap-1"
              >
                <span className="text-lg font-bold leading-none">@</span>
                <span className="text-[10px]">Mention</span>
              </Button>
            </div>

            {/* Info List */}
            <div className="space-y-4 mt-2">
              {email && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Email
                  </p>
                  <p className="text-sm">{email}</p>
                </div>
              )}

              {phone && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Phone
                  </p>
                  <p className="text-sm">{phone}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  Bio
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {"bio" in data && data.bio ? data.bio : "No bio available."}
                </p>
              </div>
            </div>

            {/* Media Links */}
            <div className="mt-auto pb-8 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between h-12 px-0 hover:bg-transparent"
              >
                <span className="font-medium">Shared Media</span>
                <div className="flex items-center text-muted-foreground">
                  <span className="text-xs mr-2">124 files</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
