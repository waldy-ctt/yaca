import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";

interface StatusDisplayButtonProps {
  status: 'online' | 'offline' | 'sleep' | 'dnd'
}

function StatusDisplayButton({status}: StatusDisplayButtonProps) {
  return (
    <>
      <div>
        <Status status={status} className="h-6 w-20" >
          <StatusIndicator />
          <StatusLabel />
        </Status>
      </div>
    </>
  );
}

export default StatusDisplayButton;
