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
import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { socket } from "../../api/socket";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { getUsersList } from "../../redux/usersList/usersListThunk";

const UserList = ({
  onSelect,
}: {
  onSelect: (userId: string, chatId: string) => void;
}) => {
  const [view, setView] = useState<"chats" | "all">("chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const usersList = useAppSelector((state) => state.userList.usersList);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUsersList(view));
  }, [view, dispatch]);
  useEffect(() => {
    setSearchTerm('')
  }, [onSelect]);

  useEffect(() => {
    socket.on("online-users", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("online-users");
    };
  }, []);

  // Filter users based on search term
  const filteredUsers = usersList.filter(
    ({ user }) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
        {filteredUsers.map(({ user, chatId }) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <ListItem key={user._id}>
              <ListItemButton onClick={() => onSelect(user._id, user.name, chatId)}>
                <ListItemText
                  primary={
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
                  }
                  secondary={user.email}
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
