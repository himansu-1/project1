import UserList from './UserList';
import MessageWindow from './MessageWindow'; // you'll create this
import { Box, Paper, Typography } from '@mui/material';
import useChat from '../../hooks/useChat';
import ProtectedRoute from '../ProtectedRoute';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { incrementUnreadForUser, moveUserToTop } from '../../redux/usersList/usersListSlice';
import { receiveMessage } from '../../redux/messages/messagesThunks';
import { socket } from '../../api/socket';

const ChatPage = () => {
    const { selectedChat, selectChat, clearChat } = useChat();    
    const hasInitializedRef = useRef(false);
    const dispatch = useAppDispatch();
    const auth: any = useAppSelector((state) => state.auth);

    useEffect(() => {        
        hasInitializedRef.current = true;
        
        const handleReceiveMessage = (data: any) => {
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
                    <UserList onSelect={selectChat} />
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
