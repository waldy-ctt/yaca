import { presence_status } from "./enums";

export interface ConversationModel {
  id: string;
  participants: string[];
  isPinned: boolean;
  unreadMessageAmount?: number;
  lastMessageTime: Date;
  name?: string;
  avatar?: string;
  status?: presence_status,
  lastMessage: string;
  isRead: boolean;
}
