// src/redux/onlineUser/onlineUserSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  onlineUser: [],
  loading: false,
  error: null,
};

const onlineUserSlice = createSlice({
  name: 'onlineUser',
  initialState,
  reducers: {
    onlineUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    onlineUserSuccess: (state, action) => {
      state.loading = false;
      state.onlineUser = action.payload;
    },
    onlineUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

export const { onlineUserStart, onlineUserSuccess, onlineUserFailure } = onlineUserSlice.actions;
export default onlineUserSlice.reducer;
