// src/renderer/src/types/conversation.ts
import { presence_status } from "./enums";

export interface ConversationDto {
  id: string;
  participants: string[];
  avatar: string | null;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  pinnedBy: string[];
  status?: presence_status; // ✅ Add this
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationModel {
  id: string;
  participants: string[];
  isPinned: boolean;
  unreadMessageAmount?: number;
  lastMessageTime: string;
  name?: string;
  avatar: string | null;
  status?: presence_status; // ✅ Make sure this is here
  lastMessage: string;
  isRead: boolean;
}
