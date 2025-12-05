import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { presence_status } from "@/types";
import { StatusConfigInterface } from "./userInfo";
import { useUserStore } from "@/stores/userStore";

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
  const { updateUser, user } = useUserStore();

  const handleStatusChange = (newStatus: string) => {
    updateUser({
      email: user?.email,
      id: user?.id,
      name: user?.name,
      status: newStatus as presence_status,
      avatar: user?.avatar ?? null,
      bio: user?.bio,
      tel: user?.tel,
      username: user?.username,
    });
    updateIsOpen(false);
  };

  return (
    <>
      <div>
        <Dialog open={isOpen} onOpenChange={updateIsOpen}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle>Change Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {Array.from(statusConfig.keys()).map((statusKey) => {
                return (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusChange(statusKey)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent focus:outline-none ${
                      status === statusKey ? "bg-accent" : ""
                    }`}
                  >
                    <div
                      className={`size-3 rounded-full ${statusConfig.get(statusKey)?.color}`}
                    />
                    <span className="font-medium">
                      {statusConfig.get(statusKey)?.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default StatusChangeDialog;
