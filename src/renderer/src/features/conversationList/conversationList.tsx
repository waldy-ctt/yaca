import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import MainPageSheet from "./components/mainPageSheet";
import { ConversationItem } from "./components/conversationItem";
import { t } from "i18next";

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

      <p className="font-bold text-lg">{t('chats')}</p>
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


