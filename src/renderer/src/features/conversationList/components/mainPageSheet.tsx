import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Info, LogOut, Languages, SunMoon } from "lucide-react";
import UserInfo from "./userInfo";
import { ROUTES } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/routes";
import { useSettingsStore } from "@/stores/settingStore";
import { t } from "i18next";

interface MainPageSheetProps {
  children: React.ReactNode;
}

// const statusConfig = {
//   online: { label: "Online", color: "bg-green-500", icon: "●" },
//   offline: { label: "Offline", color: "bg-gray-400", icon: "●" },
//   sleep: { label: "Sleep", color: "bg-yellow-500", icon: "●" },
//   dnd: { label: "Do Not Disturb", color: "bg-red-500", icon: "●" },
// };

function MainPageSheet({ children }: MainPageSheetProps) {
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const { user } = useAuthStore();
  const { logout } = useAuthStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // const handleNavigation = (route: string) => {
  //   setIsSheetOpen(false);
  // };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[320px] pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)] [&>button]:hidden transition-all duration-500 ease-out data-[state=open]:duration-500 data-[state=closed]:duration-300 flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="">
            {/* User Info Section */}
            <UserInfo />
          </SheetHeader>

          <Separator className="mb-2" />

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 px-2 py-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-base font-normal hover:bg-accent hidden"
              onClick={() => {
              }}
            >
              <User className="size-5" />
              <span>{t('my_profile')}</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-base font-normal hover:bg-accent hidden"
              onClick={() => {
              }}
            >
              <Settings className="size-5" />
              <span>Settings</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-base font-normal hover:bg-accent hidden"
              onClick={() => {
              }}
            >
              <Info className="size-5" />
              <span>About</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-base font-normal hover:bg-accent"
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light')
              }}
            >
              <SunMoon className="size-5" />
              <span>Change Theme</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-base font-normal hover:bg-accent"
              onClick={() => {
                setLanguage(language === 'vi' ? 'en' : 'vi')
              }}
            >
              <Languages className="size-5" />
              <span>Change Language</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-base font-normal hover:bg-accent"
              onClick={() => {
                logout();
                router.navigate({to: ROUTES.LOGIN})
              }}
            >
              <LogOut className="size-5" />
              <span>LogOut</span>
            </Button>
          </nav>

          {/* Footer */}
          <div className="px-3 py-2 text-xs text-muted-foreground border-t">
            <p className="truncate">{user?.tel ?? ""}</p> {/* TODO: Change this to some what other */}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default MainPageSheet;
