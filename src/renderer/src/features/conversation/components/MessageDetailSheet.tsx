import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Reply, Trash2  } from "lucide-react";
import { UIMessage } from "@/types";

interface MessageDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message: UIMessage | null;
  onReaction: (emoji: string) => void;
  onDelete: () => void;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function MessageDetailSheet({
  isOpen,
  onClose,
  message,
  onReaction,
  onDelete,
}: MessageDetailSheetProps) {
  if (!message) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4 flex flex-row items-center justify-between space-y-0">
          <SheetTitle>Message Details</SheetTitle>
          <SheetDescription className="sr-only">
            Actions for the selected message
          </SheetDescription>
          {/* Close button handled by Sheet automatically, but we can add custom if needed */}
        </SheetHeader>

        {/* Message Preview */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm border">
          <p className="line-clamp-4 italic">"{message.content.content}"</p>
        </div>

        {/* Reactions */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Quick Reactions</h4>
          <div className="flex gap-2 flex-wrap">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction(emoji);
                  onClose();
                }}
                className="text-2xl hover:scale-125 transition-transform active:scale-95 bg-secondary/50 hover:bg-secondary rounded-xl p-3 w-12 h-12 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-3 h-12">
            <Reply className="w-4 h-4" />
            Reply
          </Button>
          
          <Button variant="outline" className="w-full justify-start gap-3 h-12">
            <Copy className="w-4 h-4" />
            Copy Text
          </Button>

          {message.isMine && (
            <Button 
              variant="destructive" 
              className="w-full justify-start gap-3 h-12 mt-2"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Message
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
