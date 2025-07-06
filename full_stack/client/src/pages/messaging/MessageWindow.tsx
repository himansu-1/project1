import React, { useEffect, useRef, useState } from 'react';
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
    userName: string;
    chatId: string;
    onBack: () => void;
}) => {

    const [messages, setMessages] = useState<Array<any>>([]);
    const [newMessage, setNewMessage] = useState('');
    const pageNumberRef = useRef(1);
    const messageContainerRef = useRef<HTMLDivElement | null>(null);

    const [isTyping, setIsTyping] = useState(false);
    const [localChatId, setLocalChatId] = useState(chatId);
    const scrollRef = useRef<HTMLDivElement>(null);
    const auth: any = useAppSelector((state) => state.auth)
    let firstUnreadIndex = false
    const user = auth?.user

    const dispatch = useDispatch<AppDispatch>();
    const fetchedMessages = useAppSelector((state) => state.messages.messages);
    const hasMore = useAppSelector((state) => state.messages.hasMore);
    const hasFetchedRef = useRef(false);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingSentRef = useRef(false);

    // Typing indicator for the other user
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!isTypingSentRef.current) {
            socket.emit("typing", { toUserId: userId });
            isTypingSentRef.current = true;
        }

        // Reset timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop-typing", { toUserId: userId });
            isTypingSentRef.current = false;
        }, 2000);
    };

    // Fetching more messages
    const handleScroll = () => {
        const container = messageContainerRef.current;
        if (!container || !hasMore) return;

        if (container.scrollTop === 0) {
            // Save scroll height before loading new messages
            const prevScrollHeight = container.scrollHeight;

            pageNumberRef.current += 1;
            dispatch(fetchAllMessage(userId, localChatId, pageNumberRef.current))
                .then(() => {
                    // Wait a tick for DOM to update, then restore scroll position
                    setTimeout(() => {
                        if (container) {
                            const newScrollHeight = container.scrollHeight;
                            container.scrollTop = newScrollHeight - prevScrollHeight;
                        }
                    }, 0);
                });
        }
    };

    // Sending message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const newChatId = await dispatch(sendMessages(newMessage, userId, localChatId));
        if (!localChatId && newChatId) {
            setLocalChatId(newChatId);
        }
        setNewMessage('');
    }

    // Receiving message from socket
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
    }, [userId, user?._id, dispatch]);

    // Fetching messages
    useEffect(() => {
        const handleIncomingTyping = (data: any) => {
            console.log("Typing event received from:", data.fromUserId);
            if (data.fromUserId === userId) {
                setIsTyping(true);
            }
        }
        const handleStopTyping = (data: any) => {
            console.log("Stop typing event received from:", data.fromUserId);
            if (data.fromUserId === userId) {
                setIsTyping(false);
            }
        }
        socket.on("typing", handleIncomingTyping);
        socket.on("stop-typing", handleStopTyping);
        return () => {
            socket.off("typing", handleIncomingTyping);
            socket.off("stop-typing", handleStopTyping);
        };
    }, [chatId, userId]);

    useEffect(() => {
        if (!chatId || !userId || hasFetchedRef.current) return;

        setLocalChatId(chatId);
        pageNumberRef.current = 1;

        hasFetchedRef.current = true;

        dispatch(clearAllMessages());
        dispatch(fetchAllMessage(userId, localChatId, 1, 20));
        return () => {
            setMessages([]);
            dispatch(clearAllMessages());
        };
    }, [chatId, userId]);

    useEffect(() => {
        const sorted = [...fetchedMessages].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);

        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    }, [fetchedMessages]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
                <Button onClick={onBack}>Back</Button>
                <Typography variant="h6" mt={1}>Chat with: {userName} {isTyping && <>is typing...</>}</Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    backgroundColor: '#f5f5f5',
                }}
                ref={messageContainerRef}
                onScroll={handleScroll}
            >
                <Stack spacing={1}>
                    {hasMore && (
                        <Typography align="center" variant="body2" sx={{ mb: 1 }}>
                            Loading older messages...
                        </Typography>
                    )}

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
                    onChange={handleTyping}
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