// src/renderer/src/features/conversationList/components/ListHeader.tsx
// ← Create this new file for the conversation list header

import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import NewConversationSheet from "../newConversationSheet";
import { useState } from "react";
import MainPageSheet from "./mainPageSheet";

export default function ListHeader() {
  const [isNewOpen, setIsNewOpen] = useState(false);

  return (
    <>
      <div className="h-16 bg-popover flex items-center justify-between px-4 border-b">
        <MainPageSheet>
          <Button variant="ghost" size="icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </MainPageSheet>

        <h1 className="text-lg font-semibold">Chats</h1>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsNewOpen(true)}>
            <Plus className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <NewConversationSheet
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
      />
    </>
  );
}
