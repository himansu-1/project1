// pages/ChatPage.tsx
import React from 'react';
import UserList from './UserList';
import MessageWindow from './MessageWindow'; // you'll create this
import { Box, Paper, Typography } from '@mui/material';
import useChat from '../../hooks/useChat';

const ChatPage = () => {
    const { selectedChat, selectChat, clearChat } = useChat();

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

export default ChatPage;
