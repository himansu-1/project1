// src/redux/usersList/usersListSlice.js
import { createSlice } from '@reduxjs/toolkit';

interface usersList {
  usersList: any[];
  loading: boolean;
  error: string | null;
}

const initialState: usersList = {
  usersList: [],
  loading: false,
  error: null,
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
    }
  },
});

export const { usersListStart, usersListSuccess, usersListFailure } = usersListSlice.actions;
export default usersListSlice.reducer;
