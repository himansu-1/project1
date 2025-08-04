import UserList from './UserList';
import MessageWindow from './MessageWindow'; // you'll create this
import { Box, Paper, Typography } from '@mui/material';
import useChat from '../../hooks/useChat';
import ProtectedRoute from '../ProtectedRoute';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addUserToChatList, incrementUnreadForUser, moveUserToTop } from '../../redux/usersList/usersListSlice';
import { receiveMessage } from '../../redux/messages/messagesThunks';
import { socket } from '../../api/socket';
import { clearUsersList, getUsersList } from '../../redux/usersList/usersListThunk';

const ChatPage = () => {

    const { selectedChat, selectChat, clearChat } = useChat();
    const hasInitializedRef = useRef(false);
    const auth: any = useAppSelector((state) => state.auth);

    const [view, setView] = useState<"chats" | "all">("chats");
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const usersList = useAppSelector((state) => state.userList.usersList);
    const allUsers = useAppSelector((state) => state.userList.allUsers);
    const dispatch = useAppDispatch();

    console.log("ChatPage usersList:", usersList);
    

    useEffect(() => {
        dispatch(getUsersList(view));

        return () => {
            dispatch(clearUsersList());
        }
    }, [view, dispatch]);

    useEffect(() => {
        setSearchTerm('')
    }, [selectChat]);

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

    useEffect(() => {
        hasInitializedRef.current = true;

        const handleReceiveMessage = (data: any) => {
            const senderId = data.from;
            console.log("Received message from:", data);

            const userExistsInChats = usersList.some(u => u.user._id === senderId);

            if (!userExistsInChats) {
                const userFromAllUsers = allUsers.find(u => u._id === senderId);

                if (userFromAllUsers) {
                    dispatch(addUserToChatList({ user: userFromAllUsers, chatId: data.chatId || null }));
                } else {
                    console.warn("User data not available in message payload for new sender", senderId);
                }
            }

            // Move user to top of the list
            dispatch(moveUserToTop(data.from));

            if (selectedChat?.userId === data.from) {
                dispatch(receiveMessage(data.message, auth?.user?._id));
            } else {
                dispatch(incrementUnreadForUser({
                    fromUserId: data.from,
                    messageText: data.message.messageText
                }));
            }
        };

        socket.on("receive-message", handleReceiveMessage);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
        };
    }, [dispatch, auth?.user?._id, selectedChat?.userId]);

    return (
        <>
            <Box sx={{ display: 'flex', height: '95vh' }}>
                {/* Sidebar: User List */}
                <Paper
                    sx={{
                        width: { xs: '100%', sm: '30%', md: '25%' },
                        overflowY: 'auto',
                    }}
                >
                    <UserList
                        onSelect={selectChat}
                        filteredUsers={filteredUsers}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        view={view}
                        setView={setView}
                        onlineUsers={onlineUsers}
                    />
                </Paper>
                {/* Main Chat Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!selectedChat ? (
                        <Box
                            sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                p: 2,
                            }}
                        >
                            <Typography variant="h5" color="text.secondary">
                                Welcome to my chat app. Select a user to start chatting.
                            </Typography>
                        </Box>
                    ) : (
                        <MessageWindow
                            key={selectedChat.chatId}
                            userId={selectedChat.userId}
                            userName={selectedChat.userName}
                            chatId={selectedChat.chatId}
                            onBack={clearChat}
                        />
                    )}
                </Box>
            </Box >
        </>
    );
};

export default ProtectedRoute(ChatPage);
