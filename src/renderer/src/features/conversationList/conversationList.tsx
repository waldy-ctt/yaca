import { Button } from "@/components/ui/button";
import { Menu, Plus, Search } from "lucide-react";
import MainPageSheet from "./components/mainPageSheet";
import { ConversationItem } from "./components/conversationItem";
import { t } from "i18next";
import { router } from "@/routes";
import { ROUTES } from "@/types";
import { useEffect, useState } from "react";
import NewConversationSheet from "./newConversationSheet";
import { apiGet } from "@/lib/api";

function ConversationListScreen() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-16 bg-popover flex justify-center items-center text-popover-foreground">
        <Header />
      </div>

      <div className="flex-1 overflow-auto">
        <ConversationList />
      </div>
    </div>
  );
}

export default ConversationListScreen;

interface Convo {
  id: string; // Added ID so we can navigate correctly
  lastMessage: string;
  name: string;
  opponentAvatar: string | null;
  isPinned: boolean;
  latestTimestamp: string | Date; // Allow both for flexibility
  isRead: boolean;
}

function ConversationList() {
  // 1. One source of truth for state
  const [conversations, setConversations] = useState<Convo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. The Fetch Logic
  const fetchConversationList = async () => {
    try {
      // Assuming apiGet returns an array or { data: Array }
      const response: any = await apiGet("/conversation");

      // Safety check: Ensure we are mapping over an array
      // If your API returns { data: [...] }, change this to response.data
      const rawData = Array.isArray(response) ? response : response.data || [];

      const formattedData: Convo[] = rawData.map((item: any) => ({
        id: item.id, // Ensure your backend sends this!
        name: item.name,
        lastMessage: item.lastMessage || "Started a conversation",
        latestTimestamp: item.lastMessageTimestamp || new Date(),
        opponentAvatar: item.avatar,
        isPinned: item.isPinned || false,
        isRead: item.isRead || false,
      }));

      // 3. Set state ONCE with the new array
      setConversations(formattedData);
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. The Effect
  // dependency array [] means "Run only once when component mounts"
  useEffect(() => {
    fetchConversationList();
  }, []);

  // Optional: Filter logic if you want to separate Pinned/Normal visually
  const pinned = conversations.filter((c) => c.isPinned);
  const normal = conversations.filter((c) => !c.isPinned);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Pinned Section */}
      {pinned.length > 0 && (
        <>
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
            PINNED
          </div>
          {pinned.map((data) => (
            <ConversationItem
              key={data.id} // distinct key is required
              lastMessage={data.lastMessage}
              name={data.name}
              opponentAvatar={data.opponentAvatar || ""}
              isPinned={data.isPinned}
              latestTimestamp={data.latestTimestamp}
              isRead={data.isRead}
              onClick={() => {
                router.navigate({
                  to: ROUTES.CONVERSATION + "/$conversationId",
                  params: { conversationId: data.id },
                });
              }}
            />
          ))}
        </>
      )}

      {/* Normal Section */}
      {normal.map((data) => (
        <ConversationItem
          key={data.id}
          lastMessage={data.lastMessage}
          name={data.name}
          opponentAvatar={data.opponentAvatar || ""}
          isPinned={data.isPinned}
          latestTimestamp={data.latestTimestamp}
          isRead={data.isRead}
          onClick={() => {
            router.navigate({
              to: ROUTES.CONVERSATION + "/$conversationId",
              params: { conversationId: data.id },
            });
          }}
        />
      ))}

      {conversations.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No conversations yet
        </div>
      )}
    </div>
  );
}

function Header() {
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center w-full px-2 gap-2">
        <MainPageSheet>
          <Button
            variant={"outline"}
            size={"icon"}
            className="hover:outline-none focus:outline-none hover:border-none focus:border-none"
          >
            <Menu />
          </Button>
        </MainPageSheet>

        <p className="font-bold text-lg flex-1 text-center">{t("chats")}</p>

        <div className="flex gap-2">
          <Button
            variant={"outline"}
            size={"icon"}
            className="hover:outline-none focus:outline-none hover:border-none focus:border-none"
            onClick={() => setIsNewConversationOpen(true)}
          >
            <Plus />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className="hover:outline-none focus:outline-none hover:border-none focus:border-none"
          >
            <Search />
          </Button>
        </div>
      </div>

      {/* New Conversation Sheet */}
      <NewConversationSheet
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
      />
    </>
  );
}
