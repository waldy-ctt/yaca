import { presence_status } from "./enums";

export interface ConversationModel {
  id: string;
  participantsIdList: string[];
  isPinned: boolean;
  unreadMessageAmount?: number;
  lastMessageTime: Date;
  name?: string;
  avatar?: string;
  status?: presence_status,
  lastMessage: string;
  isRead: boolean;
}
