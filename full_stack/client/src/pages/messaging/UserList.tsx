// components/UserList.tsx
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useState, type SetStateAction } from "react";
import { socket } from "../../api/socket";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearUsersList, getUsersList } from "../../redux/usersList/usersListThunk";
import { selectChat } from "../../redux/chat/chatSlice";
import type { Dispatch } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface FilteredUser {
  user: User;
  chatId: string;
  unreadCount: number;
  lastUnreadMessage?: string;
}

interface UserListProps {
  onSelect: (userId: string, chatId: string, userName: string) => void;
  filteredUsers: FilteredUser[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<SetStateAction<string>>;
  view: "chats" | "all";
  setView: React.Dispatch<SetStateAction<"chats" | "all">>;
  onlineUsers: string[]; // array of user._id strings
}

const UserList = ({
  onSelect,
  filteredUsers,
  searchTerm,
  setSearchTerm,
  view,
  setView,
  onlineUsers,
}: UserListProps
) => {
  const dispatch = useAppDispatch();

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
      >
        <Typography variant="h6">
          {view === "chats" ? "Chats" : "All Users"}
        </Typography>
        <Button
          size="small"
          onClick={() => setView(view === "chats" ? "all" : "chats")}
        >
          {view === "chats" ? "Show All" : "Show Chats"}
        </Button>
      </Stack>
      {/* Search Field */}
      <Stack paddingX={2} paddingBottom={1}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm("")}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <List>
        {filteredUsers.map(({ user, chatId, unreadCount, lastUnreadMessage }) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <ListItem key={user._id}>
              <ListItemButton onClick={() => {
                onSelect(user._id, chatId, user.name);
                dispatch(selectChat({
                  userId: user._id,
                  userName: user.name,
                  chatId: chatId
                }));
              }}>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" gap={1}>
                        {user.name}
                        {isOnline && (
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              bgcolor: "#00f",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </Stack>
                      {unreadCount > 0 && (
                        <Box
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            borderRadius: "50%",
                            minWidth: 24,
                            height: 24,
                            fontSize: 12,
                            textAlign: "center",
                            lineHeight: "24px",
                          }}
                        >
                          {unreadCount}
                        </Box>
                      )}
                    </Stack>
                  }
                  secondary={lastUnreadMessage || user.email}
                />

              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default UserList;
