import { getInitials } from "@/lib/utils";
import { presence_status } from "@/types";
import { useState } from "react";
import StatusChangeDialog from "./statusChangeDialog";
import { useUserStore } from "@/stores/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface StatusConfigInterface {
  label: string;
  color: string;
  icon: string;
}

function UserInfo(): JSX.Element {
  const { user } = useUserStore();
  const status = user?.status ?? presence_status.NONE;
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

  return (
    <>
      <div className="flex flex-col gap-3 px-2 pt-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-14 border-2 border-primary/20">
            <AvatarImage src={user?.avatar ?? ""} alt={user?.name ?? ""} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(user?.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{user?.name ?? ""}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {user?.username ?? ""}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-1">
          <p className="text-sm text-muted-foreground truncate">{user?.bio ?? ""}</p>
        </div>

        {/* Status Button */}
        <button
          onClick={() => setIsStatusOpen(true)}
          className="flex items-center gap-2 px-3 pt-2 rounded-lg hover:bg-accent transition-colors group focus:outline-none"
        >
          <div
            className={`size-3 rounded-full ${statusConfig.get(status)?.color}`}
          />
          <span className="text-sm font-medium group-hover:underline">
            {statusConfig.get(status)?.label}
          </span>
        </button>
        <StatusChangeDialog
          statusConfig={statusConfig}
          updateIsOpen={(data) => {
            setIsStatusOpen(data);
          }}
          isOpen={isStatusOpen}
        />
      </div>
    </>
  );
}

export default UserInfo;
