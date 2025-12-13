import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, User, Loader2 } from "lucide-react"; // Added Loader2 for better UX
import { router } from "@/routes";
import { ConversationDto, ROUTES } from "@/types";
import { apiGet } from "@/lib/api";

interface UserI {
  id: string;
  name: string;
  avatar: string | null;
  username?: string;
  bio?: string;
}

interface NewConversationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect?: (user: UserI) => void;
}

function NewConversationSheet({
  isOpen,
  onClose,
  onUserSelect,
}: NewConversationSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserI[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New state to show loading specifically when clicking a user
  const [isCheckingConv, setIsCheckingConv] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Cleaned up the fetching logic
      const response: any = await apiGet("/users?limit=20");
      if (response && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // ⚡ THE NEW LOGIC
  // -----------------------------------------------------------------------
  const handleUserClick = async (user: UserI) => {
    if (onUserSelect) {
      onUserSelect(user);
      onClose();
      return;
    }

    setIsCheckingConv(user.id); // Show spinner on the specific user

    try {
      const existingConv = await apiGet<ConversationDto>(`/conversation/users/${user.id}`);
      onClose(); // Close sheet before navigating

      if (existingConv && existingConv.id) {
        // CASE A: Conversation exists -> Go to it
        console.log("Found existing chat:", existingConv.id);
        router.navigate({
          to: `${ROUTES.CONVERSATION}/$conversationId`,
          params: { conversationId: existingConv.id },
        });
      } else {
        // CASE B: No conversation -> Go to "Draft" mode
        // We pass the recipientId in the URL search params so the Chat page knows who we are talking to.
        console.log("Starting new draft chat with:", user.name);
        router.navigate({
          to: `${ROUTES.CONVERSATION}/new`, 
          search: { recipientId: user.id }, 
        });
      }
    } catch (error) {
      console.error("Error checking conversation:", error);
      // Fallback: Just go to 'new' if the check fails to avoid locking the UI
      onClose();
      router.navigate({
        to: `${ROUTES.CONVERSATION}/new`,
        search: { recipientId: user.id },
      });
    } finally {
      setIsCheckingConv(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">New Conversation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <User className="h-10 w-10 mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                </div>

                {/* Loading Spinner for specific user click */}
                {isCheckingConv === user.id && (
                   <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NewConversationSheet;
