import { presence_status } from "./enums";

export interface ConversationDto {
  id: string;
  participants: string[];
  avatar: string | null;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  pinnedBy: string[];
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
  status?: presence_status,
  lastMessage: string;
  isRead: boolean;
}
