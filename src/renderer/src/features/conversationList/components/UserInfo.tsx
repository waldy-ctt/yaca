import { getInitials } from "@/lib/utils";
import { presence_status } from "@/types";
import { useState } from "react";
import StatusChangeDialog from "./statusChangeDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";

export interface StatusConfigInterface {
  label: string;
  color: string;
  icon: string;
}

function UserInfo(): JSX.Element {
  const { user } = useAuthStore();
  const status = user?.status ?? presence_status.OFFLINE;
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);

  const statusConfig: Map<presence_status, StatusConfigInterface> = new Map<
    presence_status,
    StatusConfigInterface
  >([
    [
      presence_status.ONLINE,
      { label: "Online", color: "bg-green-500", icon: "●" },
    ],
    [
      presence_status.OFFLINE,
      { label: "Offline", color: "bg-gray-400", icon: "●" },
    ],
    [
      presence_status.SLEEP,
      { label: "Sleep", color: "bg-yellow-500", icon: "●" },
    ],
    [
      presence_status.DND,
      { label: "Do Not Disturb", color: "bg-red-500", icon: "●" },
    ],
  ]);

  const currentStatus = statusConfig.get(status);

  // Fallback values if user data is not loaded yet
  const displayName = user?.name || "Loading...";
  const displayUsername = user?.username || "username";
  const displayBio = user?.bio || "";
  const displayAvatar = user?.avatar || null;

  return (
    <>
      <div className="flex flex-col gap-4 px-2 pt-2">
        {/* Avatar + Name Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-16 border-2 border-primary/20 shadow-sm">
              <AvatarImage 
                src={displayAvatar || ""} 
                alt={displayName} 
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            
            {/* Status Indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-background bg-background flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full ${currentStatus?.color || "bg-gray-400"}`} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate leading-tight">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              @{displayUsername}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        {displayBio && (
          <div className="px-1">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {displayBio}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <button
          onClick={() => setIsStatusOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors group focus:outline-none w-fit"
        >
          <div className={`size-2.5 rounded-full ${currentStatus?.color || "bg-gray-400"}`} />
          <span className="text-sm font-medium group-hover:underline">
            {currentStatus?.label || "Unknown"}
          </span>
        </button>
      </div>

      <StatusChangeDialog
        statusConfig={statusConfig}
        updateIsOpen={(data) => setIsStatusOpen(data)}
        isOpen={isStatusOpen}
        status={status}
      />
    </>
  );
}

export default UserInfo;
