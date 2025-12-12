export interface MessageContentModel {
  content: string;
  type: 'text' | 'image' | 'system';
}

export interface MessageReactionModel {
  type: 'like' | 'heart' | 'laugh';
  sender: string;
}

export interface MessageModel {
  id: string;
  conversationId: string;
  content: MessageContentModel;
  reaction: MessageReactionModel[];
  senderId: string;
  createdAt: string; 
  updatedAt?: string;
  senderName?: string; 
  senderAvatar?: string;
}

export type UIMessage = MessageModel & {
  isMine: boolean;
  status?: "sending" | "sent" | "read" | "failed"; 
};
