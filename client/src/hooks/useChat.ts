// hooks/useChat.ts
import { useState } from 'react';

export default function useChat() {
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    chatId: string;
  } | null>(null);

  const selectChat = (userId: string, chatId: string) => {
    setSelectedChat({ userId, chatId });
  };

  const clearChat = () => setSelectedChat(null);

  return { selectedChat, selectChat, clearChat };
}
