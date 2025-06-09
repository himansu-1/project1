import { createSlice } from '@reduxjs/toolkit';

interface MessagesState {
  messages: any[];
  chatId: string | null;
  loading: boolean;
  error: string | null;
}
const initialState: MessagesState = {
  messages: [],
  chatId: null,
  loading: false,
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    messagesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    messagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload.messages;
      state.chatId = action.payload.chatId;
    },
    messagesSendSuccess: (state, action) => {
      state.loading = false;
      
      // Ensure state.messages is always an array before appending
      const existingMessages = Array.isArray(state.messages) ? state.messages : [];
      state.messages = [...existingMessages, action.payload.message];

      if (action.payload.chatId) {
        state.chatId = action.payload.chatId;
      }
    },
    messagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.chatId = null;
    },
  },
});

export const { messagesStart, messagesSuccess, messagesFailure, messagesSendSuccess, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
