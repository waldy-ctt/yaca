import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Check,
  CheckCheck,
  Clock,
  Smile,
  Trash2,
  Copy,
  Reply,
  X,
  ChevronRight,
} from "lucide-react";
import { router } from "@/routes";
import { ROUTES } from "@/types";
import { apiPost, ws } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

// Types
type MessageStatus = "sending" | "sent" | "read";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  isMine: boolean;
  senderName?: string;
  reactions?: string[];
}

interface User {
  id: string;
  name: string;
  avatar: string | null;
  status: "online" | "offline" | string;
}

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggleSelect: () => void;
}

// Message Item Component
function MessageItem({
  message,
  isSelected,
  selectionMode,
  onPress,
  onLongPress,
  onToggleSelect,
}: MessageItemProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="w-3 h-3" />;
      case "sent":
        return <Check className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
  };

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect();
    } else {
      onPress();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectionMode) {
      onLongPress();
    }
  };

  return (
    <div
      className={`flex ${message.isMine ? "justify-end" : "justify-start"} px-4 py-1`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className={`relative max-w-[75%] ${selectionMode ? "pr-10" : ""}`}>
        {selectionMode && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-orange-500 border-orange-500"
                  : "border-gray-400"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}

        <div
          className={`rounded-2xl px-3 py-2 transition-all ${
            message.isMine
              ? "bg-orange-500 text-white rounded-br-md"
              : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-md"
          } ${isSelected ? "ring-2 ring-orange-500" : ""}`}
        >
          {!message.isMine && message.senderName && (
            <p className="text-xs font-semibold mb-1 text-orange-600 dark:text-orange-400">
              {message.senderName}
            </p>
          )}
          <p className="text-sm break-words">{message.content}</p>

          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {message.reactions.map((reaction, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5"
                >
                  {reaction}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-1 mt-1">
            <span
              className={`text-[10px] ${
                message.isMine
                  ? "text-white/70"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formatTime(message.timestamp)}
            </span>
            {message.isMine && (
              <span
                className={`${
                  message.status === "read" ? "text-blue-400" : "text-white/70"
                }`}
              >
                {getStatusIcon()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function SideSheet({ isOpen, onClose, children }: SideSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-white dark:bg-gray-800 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "slideLeft 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
}

function ContextMenu({ isOpen, onClose, items }: ContextMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute top-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 min-w-48"
        style={{
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              item.destructive
                ? "text-red-500"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MessageDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onReaction: (emoji: string) => void;
  onDelete: () => void;
}

function MessageDetailSheet({
  isOpen,
  onClose,
  message,
  onReaction,
  onDelete,
}: MessageDetailSheetProps) {
  if (!message) return null;

  const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Message Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-900 dark:text-white">
            {message.content}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Sent by</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {message.isMine ? "You" : message.senderName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Time</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {message.timestamp.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span className="font-medium capitalize text-gray-900 dark:text-white">
              {message.status}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Quick Reactions
          </p>
          <div className="flex gap-2 flex-wrap">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction(emoji);
                  onClose();
                }}
                className="text-2xl hover:scale-125 transition-transform active:scale-95 bg-gray-100 dark:bg-gray-700 rounded-xl p-3"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full h-11 flex items-center gap-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button className="w-full h-11 flex items-center gap-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
            <Copy className="w-4 h-4" />
            Copy Text
          </button>
          {message.isMine && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full h-11 flex items-center gap-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Message
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

interface ConversationScreenProps {
  id: string;
}

function ConversationScreen({ id }: ConversationScreenProps) {
  const [conversationId, setConversationId] = useState(id);
  console.log("HERE IS ID: ", conversationId);
  const searchParams = new URLSearchParams(window.location.search);
  const recipientId = searchParams.get("recipientId");
  const [conversationInfo, setConversationInfo] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuthStore();

  const [messageInput, setMessageInput] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    if (conversationId !== "new") {
      ws.send("SEND_MESSAGE", {
        type: "SEND_MESSAGE",
        conversationId: conversationId,
        content: messageInput,
      });
    } else {
      const newConv: any = await apiPost("/conversation", {
        participants: [user?.id, recipientId],
        initMessage: { content: messageInput, type: "text" },
        senderId: user?.id,
      });

      setConversationId(newConv.id);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      timestamp: new Date(),
      status: "sending",
      isMine: true,
    };


    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    setDetailSheetOpen(true);
  };

  const handleMessageLongPress = (messageId: string) => {
    setSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const toggleMessageSelect = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);

    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleBulkDelete = () => {
    setMessages(messages.filter((msg) => !selectedMessages.has(msg.id)));
    setSelectedMessages(new Set());
    setSelectionMode(false);
  };

  const handleReaction = (emoji: string) => {
    if (!selectedMessage) return;
    setMessages(
      messages.map((msg) =>
        msg.id === selectedMessage.id
          ? {
              ...msg,
              reactions: [...(msg.reactions || []), emoji],
            }
          : msg,
      ),
    );
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage) return;
    setMessages(messages.filter((msg) => msg.id !== selectedMessage.id));
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const contextMenuItems: ContextMenuItem[] = [
    { label: "View Profile", onClick: () => setUserDetailOpen(true) },
    { label: "Search Messages", onClick: () => console.log("Search") },
    { label: "Mute Notifications", onClick: () => console.log("Mute") },
    {
      label: "Block User",
      onClick: () => console.log("Block"),
      destructive: true,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shrink-0">
        {selectionMode ? (
          <>
            <button
              onClick={exitSelectionMode}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedMessages.size} selected
              </p>
            </div>
            <button
              onClick={handleBulkDelete}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.navigate({ to: ROUTES.HOME })}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div
              className="flex-1 flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => setUserDetailOpen(true)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.status === "online"
                    ? "online"
                    : `last seen ${user.status}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setContextMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </>
        )}
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="py-4 space-y-2">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isSelected={selectedMessages.has(message.id)}
              selectionMode={selectionMode}
              onPress={() => handleMessagePress(message)}
              onLongPress={() => handleMessageLongPress(message.id)}
              onToggleSelect={() => toggleMessageSelect(message.id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 shrink-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="w-9 h-9 shrink-0 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <MessageDetailSheet
        isOpen={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        message={selectedMessage}
        onReaction={handleReaction}
        onDelete={handleDeleteMessage}
      />

      <SideSheet
        isOpen={userDetailOpen}
        onClose={() => setUserDetailOpen(false)}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Info
            </h3>
            <button
              onClick={() => setUserDetailOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.status}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
              <p className="text-sm text-gray-900 dark:text-white">
                Available to chat anytime!
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm text-gray-900 dark:text-white">
                +1 234 567 8900
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm text-gray-900 dark:text-white">
                john.doe@example.com
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full h-11 flex items-center justify-between px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
              View Shared Media
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full h-11 flex items-center justify-between px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
              Search in Conversation
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </SideSheet>

      <ContextMenu
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        items={contextMenuItems}
      />
    </div>
  );
}

export default ConversationScreen;
