import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { ChatListItem, ChatMessage } from '@/types/chat.types';

export const chatApi = {
  listMine: () => apiClient.get<ApiResponse<ChatListItem[]>>('/chats'),
  getMessages: (chatId: string) => apiClient.get<ApiResponse<ChatMessage[]>>(`/chats/${chatId}/messages`),
  reply: (chatId: string, content: string) =>
    apiClient.post<ApiResponse<ChatMessage>>(`/chats/${chatId}/messages`, { content }),
  startChat: (advertisementId: string, content: string) =>
    apiClient.post<ApiResponse<{ chat: ChatListItem; message: ChatMessage }>>(
      `/chats/advertisements/${advertisementId}/start`,
      { content }
    ),
};
