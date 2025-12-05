import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import MainPageSheet from "./components/mainPageSheet";

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

function ConversationList() {
  const pinnedConversation = [];
  const normalConversation = [];

  const mockData = [
    {
      name: "Nguyen Thi Minh Thu",
      lastMessage: "Em dep qua em oi",
      isPinned: true,
      isRead: true,
      latestTimestamp: new Date(),
      opponentAvatar:
        "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/004ece6770a6a308cfb99377ad0e0f9a411e0e48_full.jpg",
    },
    {
      name: "Nguyen Phuc Hau",
      lastMessage: "CLQJZ?",
      isPinned: false,
      isRead: false,
      latestTimestamp: new Date("2025-11-25T12:00:00"),
      opponentAvatar: null,
    },
    {
      name: "Super Idol 105C",
      lastMessage: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et efficitur magna. Curabitur in rhoncus magna. Mauris non neque erat. Sed tristique vehicula lobortis. Etiam sodales neque mi, vel malesuada tellus accumsan rutrum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a pellentesque magna. Duis magna dolor, molestie quis nisl id, tempor iaculis ante. Proin volutpat venenatis arcu aliquet cursus. Aliquam sed sem sed dolor porttitor viverra. Curabitur felis metus, tempor sit amet volutpat posuere, porta mollis felis. Vestibulum malesuada efficitur magna, id feugiat lorem scelerisque pharetra.
Quisque facilisis congue nunc, ac ullamcorper quam dignissim sed. Donec consequat, turpis ut pulvinar luctus, nibh felis volutpat quam, sit amet suscipit sem odio vel eros. Etiam malesuada, lacus at finibus porta, sapien augue maximus leo, at porttitor ex eros ut sapien. Donec eleifend pulvinar nisi. Praesent condimentum orci a ligula dictum pellentesque. Proin id nisi et orci pulvinar elementum. Sed elementum tortor a porta interdum. Nam convallis nisl vel fermentum efficitur. Cras magna elit, blandit quis nibh vel, pharetra varius nibh. Suspendisse sed ante malesuada, cursus arcu ac, fringilla magna.
Vestibulum varius nisi et diam rhoncus, sit amet pretium nisl porttitor. Pellentesque rutrum dictum est, sed molestie justo imperdiet sit amet. Nulla ornare ligula eget orci iaculis, nec venenatis risus maximus. Curabitur vitae diam magna. Curabitur rhoncus mollis diam, ac iaculis metus porta at. Sed bibendum nulla blandit diam molestie, vitae lacinia lorem vulputate. Donec blandit eros sed eleifend vehicula. Phasellus in lectus mi.
Suspendisse potenti. Quisque ac est ut dolor pellentesque porta quis eu augue. Vestibulum eget aliquam felis. Nulla eu libero metus. Phasellus hendrerit ex a gravida venenatis. Morbi pellentesque lorem libero, in pellentesque dui eleifend at. Ut ac felis at neque dapibus luctus venenatis sed massa. Morbi vehicula vestibulum nisl sit amet feugiat. Praesent feugiat commodo interdum. Phasellus euismod augue eu urna venenatis, ut elementum diam feugiat. Duis in ultrices enim. Maecenas et elit quis arcu tincidunt mollis.
Curabitur erat est, ultrices eu erat sollicitudin, fermentum mollis nunc. Ut ac tellus a nibh tincidunt fringilla. Ut tincidunt libero sit amet sagittis vehicula. Integer pulvinar sem ante, in feugiat eros ultrices eget. Vestibulum vestibulum felis ac risus commodo, a scelerisque sem tristique. Sed sit amet sem ac neque tempor maximus. Duis in purus ultricies, pharetra est in, faucibus neque.`,
      isPinned: false,
      isRead: false,
      latestTimestamp: new Date("2025-11-23T14:02:00"),
      opponentAvatar: null,
    },
  ];

  mockData.map((data) => {
    if (data.isPinned) {
      pinnedConversation.push(data);
    } else {
      normalConversation.push(data);
    }
  });
  return (
    <>
      <div>
        {pinnedConversation.map((data) => {
          return (
            <>
              <div className="">
                <ConversationItem
                  lastMessage={data.lastMessage}
                  name={data.name}
                  opponentAvatar={data.opponentAvatar}
                  isPinned={data.isPinned}
                  latestTimestamp={data.latestTimestamp}
                  onClick={() => {}}
                  isRead={data.isRead}
                />
              </div>
            </>
          );
        })}
        {normalConversation.map((data) => {
          return (
            <>
              <div className="">
                <ConversationItem
                  lastMessage={data.lastMessage}
                  name={data.name}
                  opponentAvatar={data.opponentAvatar}
                  isPinned={data.isPinned}
                  latestTimestamp={data.latestTimestamp}
                  onClick={() => {}}
                  isRead={data.isRead}
                />
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}

function Header() {
  return (
    <div className="flex justify-between w-full px-2">
      <MainPageSheet>
        <Button
          variant={"outline"}
          size={"icon"}
          className="hover:outline-none focus:outline-none hover:border-none focus:border-none"
        >
          <Menu />
        </Button>
      </MainPageSheet>

      <p className="font-bold text-lg">Chats</p>
      <Button
        variant={"outline"}
        size={"icon"}
        className="hover:outline-none focus:outline-none hover:border-none focus:border-none"
      >
        <Search />
      </Button>
    </div>
  );
}

interface ConversationProps {
  name: string;
  lastMessage: string;
  isPinned: boolean;
  isRead: boolean; // if false -> show unread indicator
  latestTimestamp: Date;
  opponentAvatar: string | null;
  onClick?: () => void;
}

export function ConversationItem({
  name,
  lastMessage,
  isPinned,
  isRead,
  latestTimestamp,
  opponentAvatar,
  onClick,
}: ConversationProps) {
  const formattedTime = (() => {
    const now = new Date();
    const messageDate = new Date(latestTimestamp);

    // Check if it's the same calendar day
    const isToday =
      now.getDate() === messageDate.getDate() &&
      now.getMonth() === messageDate.getMonth() &&
      now.getFullYear() === messageDate.getFullYear();

    if (isToday) {
      // Same day: Return HH:MM:SS (or HH:MM)
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit", // kept seconds as per your previous code
        hour12: false,
      });
    } else {
      // Old message: Return YYYY-MM-DD
      // 'en-CA' is a shortcut for ISO format (YYYY-MM-DD)
      return messageDate.toLocaleDateString("en-CA");
    }
  })();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 p-2.5 px-3 cursor-pointer",
        "hover:bg-accent/50 transition-colors",
        isPinned && "bg-muted/30",
      )}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={opponentAvatar || ""} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-0.5">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-base text-foreground truncate">
            {name}
          </span>
          <span
            className={cn(
              "text-xs ml-2 shrink-0",
              !isRead ? "text-primary font-medium" : "text-muted-foreground",
            )}
          >
            {formattedTime}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <p className={cn("text-sm truncate pr-2", "text-muted-foreground")}>
            {lastMessage}
          </p>

          <div className="flex items-center gap-2 shrink-0 h-5">
            {isPinned && (
              <Pin className="h-3.5 w-3.5 fill-muted-foreground text-muted-foreground -rotate-45" />
            )}

            {!isRead && (
              <div className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">1</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

