import { createSlice } from "@reduxjs/toolkit";

interface ChatState {
    selectedChat: {
        userId: string;
        userName: string;
        chatId: string;
    } | null;
}

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        selectedChat: null
    } as ChatState,
    reducers: {
      selectChat: (state, action) => {
        state.selectedChat = action.payload; // { userId, userName, chatId }
      },
      clearChat: (state) => {
        state.selectedChat = null;
      }
    }
  });

  export const { selectChat, clearChat } = chatSlice.actions;
  export default chatSlice.reducer;