// src/redux/usersList/usersListSlice.js
import { createSlice } from '@reduxjs/toolkit';

interface usersList {
  usersList: any[];
  loading: boolean;
  error: string | null;
  allUsers: any[]; // Added to store all users if needed
}

const initialState: usersList = {
  usersList: [],
  loading: false,
  error: null,
  allUsers: [], // Added to store all users if needed
};

const usersListSlice = createSlice({
  name: 'usersList',
  initialState,
  reducers: {
    usersListStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    usersListSuccess: (state, action) => {
      state.loading = false;
      state.usersList = action.payload;
    },
    usersListFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    moveUserToTop: (state, action) => {
      const userId = action.payload;
      const index = state.usersList.findIndex(u => u.user._id === userId);
      if (index > -1) {
        const [userItem] = state.usersList.splice(index, 1);
        state.usersList.unshift(userItem);
      }
    },
    clearUnreadForUser: (state, action) => {
      const userId = action.payload;
      const user = state.usersList.find(u => u.user._id === userId);
      if (user) {
        user.unreadCount = 0;
        user.lastUnreadMessage = null;
      }
    },
    incrementUnreadForUser: (state, action) => {
      const { fromUserId, messageText } = action.payload;
      const user = state.usersList.find(u => u.user._id === fromUserId);
      if (user) {
        user.unreadCount = (user.unreadCount || 0) + 1;
        user.lastUnreadMessage = messageText;
      }
    },
    addUserToChatList: (state, action) => {
      const newUser = action.payload;
      const existingUser = state.usersList.find(u => u.user._id === newUser.user._id);
      if (!existingUser) {
        state.usersList.push(newUser);
      }
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },

    // optionally clear allUsers on cleanup or logout
    clearAllUsers: (state) => {
      state.allUsers = [];
    },
  },
});

export const {
  usersListStart,
  usersListSuccess,
  usersListFailure,
  moveUserToTop,
  clearUnreadForUser,
  incrementUnreadForUser,
  addUserToChatList,
  setAllUsers,
  clearAllUsers,
} = usersListSlice.actions;
export default usersListSlice.reducer;
