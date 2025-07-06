// hooks/useChat.ts
import { useState } from 'react';

export default function useChat() {
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    chatId: string;
  } | null>(null);

  const selectChat = (userId: string, userName: string, chatId: string) => {
    setSelectedChat({ userId, userName, chatId });
  };

  const clearChat = () => setSelectedChat(null);

  return { selectedChat, selectChat, clearChat };
}
