// src/features/conversation/components/ConversationInfoSheet.tsx

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  Edit3,
  Trash2,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/routes";
import { ROUTES, presence_status } from "@/types";
import { cn } from "@/lib/utils";

interface ConversationInfo {
  id: string;
  name: string;
  avatar: string | null;
  participants: string[];
  createdAt: string;
  lastMessageTimestamp?: string;
  status?: presence_status;
}

interface ParticipantInfo {
  id: string;
  name: string;
  avatar: string | null;
  username: string;
  status: presence_status;
}

interface ConversationInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export function ConversationInfoSheet({
  isOpen,
  onClose,
  conversationId,
}: ConversationInfoSheetProps) {
  const { user } = useAuthStore();
  const [info, setInfo] = useState<ConversationInfo | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const is1on1 = participants.length === 2;
  const isGroup = participants.length > 2;

  // Fetch conversation info
  useEffect(() => {
    if (!isOpen || conversationId === "new") return;

    const fetchInfo = async () => {
      setIsLoading(true);
      try {
        const convData = await apiGet<ConversationInfo>(
          `/conversations/${conversationId}`
        );
        setInfo(convData);
        setNewName(convData.name);

        // Fetch participant details
        const participantDetails = await Promise.all(
          convData.participants.map(async (pid) => {
            try {
              const userData = await apiGet<ParticipantInfo>(`/users/${pid}`);
              return userData;
            } catch {
              return {
                id: pid,
                name: "Unknown User",
                avatar: null,
                username: "unknown",
                status: presence_status.OFFLINE,
              };
            }
          })
        );

        setParticipants(participantDetails);
      } catch (error) {
        console.error("Failed to load conversation info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [isOpen, conversationId]);

  const handleSaveName = async () => {
    if (!newName.trim() || !info) return;

    setIsSaving(true);
    try {
      await apiPut(`/conversations/${conversationId}`, {
        name: newName.trim(),
      });

      setInfo({ ...info, name: newName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name:", error);
      alert("Failed to update conversation name");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      await apiDelete(`/conversations/${conversationId}`);
      setShowDeleteDialog(false);
      onClose();
      router.navigate({ to: ROUTES.HOME });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      alert("Failed to delete conversation");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: presence_status) => {
    switch (status) {
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

  if (conversationId === "new") return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Conversation Info</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Header Image */}
              <div className="h-32 bg-gradient-to-b from-primary/20 to-background" />

              <div className="px-6 -mt-12 space-y-6 pb-6">
                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg mb-3">
                    <AvatarImage
                      src={info?.avatar || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(info?.name || "?")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Editable Name */}
                  {isEditing ? (
                    <div className="w-full space-y-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={is1on1 ? "Nickname" : "Group name"}
                        className="text-center"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setNewName(info?.name || "");
                          }}
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveName}
                          disabled={isSaving || !newName.trim()}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{info?.name}</h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mt-1">
                    {is1on1 ? "Direct Message" : `${participants.length} members`}
                  </p>
                </div>

                <Separator />

                {/* Conversation Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {info?.createdAt ? formatDate(info.createdAt) : "Unknown"}
                      </p>
                    </div>
                  </div>

                  {info?.lastMessageTimestamp && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Message</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(info.lastMessageTimestamp)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Participants */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-medium">
                      {is1on1 ? "Participant" : "Members"}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={participant.avatar || ""}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(participant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background">
                            <div
                              className={cn(
                                "w-full h-full rounded-full",
                                getStatusColor(participant.status)
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {participant.name}
                            {participant.id === user?.id && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{participant.username}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  {isGroup && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave Group
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Conversation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Conversation?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              All messages in this conversation will be permanently deleted. You
              won't be able to recover them.
            </p>
            {is1on1 && (
              <p className="text-sm text-muted-foreground mt-2">
                This will delete your conversation with{" "}
                <span className="font-medium text-foreground">
                  {participants.find((p) => p.id !== user?.id)?.name}
                </span>
                .
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Conversation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
