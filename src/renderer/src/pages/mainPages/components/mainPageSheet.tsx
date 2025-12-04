import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInitials } from "@/shared/utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import StatusDisplayButton from "./statusDisplayButton";

interface MainPageSheetProps {
  children: React.ReactNode;
}

function MainPageSheet({ children }: MainPageSheetProps) {
  const user = {
    name: "Waldy",
    tel: "+84859853463",
    avatar:
      "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/005d46c6180fb0bf94018d897803e63a95131c57_full.jpg",
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>

        <SheetContent
          side="left"
          className=" 
           pt-[calc(env(safe-area-inset-top))] [&>button]:hidden transition-all duration-500 ease-out data-[state=open]:duration-500 data-[state=closed]:duration-300:"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <div className="flex w-full gap-2 items-center h-full">
              <Avatar className="size-12">
                <AvatarImage src={user.avatar ?? ""} />
                <AvatarFallback>{getInitials(user.avatar)}</AvatarFallback>
              </Avatar>

              <StatusDisplayButton status="sleep" />
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default MainPageSheet;
