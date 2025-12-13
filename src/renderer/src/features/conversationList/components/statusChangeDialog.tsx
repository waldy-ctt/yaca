import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { presence_status } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { apiPut } from "@/lib/api";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { StatusConfigInterface } from "./UserInfo";

interface StatusChangeDialogProps {
  isOpen: boolean;
  updateIsOpen: (isOpen: boolean) => void;
  statusConfig: Map<presence_status, StatusConfigInterface>;
  status?: presence_status;
}

function StatusChangeDialog({
  isOpen,
  updateIsOpen,
  statusConfig,
  status,
}: StatusChangeDialogProps): JSX.Element {
  const { updateUser, user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: presence_status) => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    try {
      // Update backend
      await apiPut("/users/me", { status: newStatus });

      // Update local state
      updateUser({
        email: user?.email,
        id: user?.id,
        name: user?.name,
        status: newStatus,
        avatar: user?.avatar ?? null,
        bio: user?.bio,
        tel: user?.tel,
        username: user?.username,
      });

      updateIsOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={updateIsOpen}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {Array.from(statusConfig.keys()).map((statusKey) => {
            const config = statusConfig.get(statusKey);
            const isActive = status === statusKey;
            
            return (
              <button
                key={statusKey}
                onClick={() => handleStatusChange(statusKey)}
                disabled={isUpdating}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent focus:outline-none relative ${
                  isActive ? "bg-accent ring-2 ring-primary/20" : ""
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`size-3 rounded-full ${config?.color}`}
                />
                <span className="font-medium flex-1 text-left">
                  {config?.label}
                </span>
                
                {isActive && (
                  <Check className="w-4 h-4 text-primary" />
                )}
                
                {isUpdating && isActive && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary absolute right-4" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StatusChangeDialog;
