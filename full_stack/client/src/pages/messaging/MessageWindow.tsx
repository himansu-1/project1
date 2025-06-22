// components/MessageWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
// import { Typography, Button } from '@mui/material';
import {
    Box,
    Button,
    TextField,
    Typography,
    Stack
} from '@mui/material';
import { socket } from '../../api/socket';
import { useAppSelector } from '../../redux/hooks';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { clearAllMessages, fetchAllMessage, receiveMessage, sendMessages } from '../../redux/messages/messagesThunks';

const MessageWindow = ({
    userId,
    userName,
    chatId,
    onBack
}: {
    userId: string;
    chatId: string;
    onBack: () => void;
}) => {

    const [messages, setMessages] = useState<Array<any>>([]);
    const [newMessage, setNewMessage] = useState('');
    const [localChatId, setLocalChatId] = useState(chatId);
    const scrollRef = useRef<HTMLDivElement>(null);
    const auth: any = useAppSelector((state) => state.auth)
    let firstUnreadIndex = false
    const user = auth?.user

    const dispatch = useDispatch<AppDispatch>();
    const fetchedMessages = useAppSelector((state) => state.messages.messages);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const newChatId = await dispatch(sendMessages(newMessage, userId, localChatId));
        if (!localChatId && newChatId) {
            setLocalChatId(newChatId);
        }
        setNewMessage('');
    }

    useEffect(() => {
        const handleMessageReceive = (data: any) => {
            if (data.from === userId) {
                dispatch(receiveMessage(data.message, user._id));
            }
        };

        socket.on('receive-message', handleMessageReceive);
        return () => {
            socket.off('receive-message', handleMessageReceive);
        };
    }, [userId, user._id, dispatch]);

    useEffect(() => {
        setLocalChatId(chatId);
        // fetchMessages();
        if (localChatId && userId) {
            dispatch(fetchAllMessage(userId, localChatId));
        }

        return () => {
            setMessages([]);
            dispatch(clearAllMessages());
        };
    }, [chatId, userId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setMessages(fetchedMessages ?? []);
        // if (!localChatId) {
        //     setLocalChatId(messages[0].chatId);
        // }
    }, [fetchedMessages]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
                <Button onClick={onBack}>Back</Button>
                <Typography variant="h6" mt={1}>Chat with: {userName}</Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    backgroundColor: '#f5f5f5',
                }}
            >
                <Stack spacing={1}>
                    {messages.map((msg, index) => {
                        const isSender = msg.senderId === user._id;

                        let showUnreadSeparator = false;
                        const isUnread = !msg.readBy?.includes(user._id);
                        if (isUnread && !firstUnreadIndex) {
                            showUnreadSeparator = true;
                            firstUnreadIndex = true;
                        }


                        return (
                            <React.Fragment key={index}>
                                {showUnreadSeparator && (
                                    <Typography
                                        component="div"
                                        sx={{
                                            fontSize: '12px',
                                            color: 'gray',
                                            textAlign: 'center',
                                            my: 1,
                                            position: 'relative',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: '1px',
                                                backgroundColor: '#ccc',
                                                width: '100%',
                                                position: 'absolute',
                                                top: '50%',
                                                left: 0,
                                                zIndex: -1,
                                            }}
                                        />
                                        <Box
                                            component="span"
                                            sx={{
                                                backgroundColor: '#f5f5f5',
                                                px: 1,
                                                position: 'relative',
                                                zIndex: 1,
                                            }}
                                        >
                                            Unread Messages
                                        </Box>
                                    </Typography>
                                )}

                                <Box
                                    sx={{
                                        alignSelf: isSender ? 'flex-end' : 'flex-start',
                                        backgroundColor: isSender ? '#1976d2' : '#e0e0e0',
                                        color: isSender ? 'white' : 'black',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        maxWidth: '70%',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    {msg.messageText}
                                </Box>
                            </React.Fragment>
                        );
                    })}
                    <div ref={scrollRef} />
                </Stack>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    p: 2,
                    borderTop: '1px solid #ccc',
                    backgroundColor: 'white'
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                />
                <Button variant="contained" onClick={sendMessage}>Send</Button>
            </Box>
        </Box>
    );
};

export default MessageWindow;