export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VOICE';
  content: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChatListItem {
  id: string;
  advertisementId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string | null;
  advertisement: {
    id: string;
    title: string;
    price: string;
    images: { url: string }[];
  };
  buyer: { id: string; fullName: string };
  seller: { id: string; fullName: string };
  messages: ChatMessage[];
}
