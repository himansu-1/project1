// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import messageReducer from './messages/messagesSlice';
import onlineUserReducer from './onlineUser/onlineUserSlice';
import usersListReducer from './usersList/usersListSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    onlineUsers: onlineUserReducer,
    userList: usersListReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;