// components/UserList.tsx
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { socket } from '../../api/socket';
import { useAppSelector } from '../../redux/hooks';

const UserList = ({ onSelect }: { onSelect: (userId: string, chatId: string) => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [view, setView] = useState<'chats' | 'all'>('chats');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const usersList = useAppSelector((state) => state.userList.usersList);

  useEffect(() => {
    setUsers(usersList);
  }, [view]);

  console.log(users);
  
  useEffect(() => {
    socket.on("online-users", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("online-users");
    };
  }, []);
  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2}>
        <Typography variant="h6">{view === 'chats' ? 'Chats' : 'All Users'}</Typography>
        <Button size="small" onClick={() => setView(view === 'chats' ? 'all' : 'chats')}>
          {view === 'chats' ? 'Show All' : 'Show Chats'}
        </Button>
      </Stack>
      <List>
        {users.map(({ user, chatId }) => {

          const isOnline = onlineUsers.includes(user._id);
          return (
            <ListItem key={user._id}>
              <ListItemButton onClick={() => onSelect(user._id, chatId)}>
                <ListItemText primary={<Stack direction="row" alignItems="center" gap={1}>
                  {user.name}
                  {isOnline && (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        bgcolor: '#00f',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </Stack>
                } secondary={user.email} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </>
  );
};

export default UserList;
