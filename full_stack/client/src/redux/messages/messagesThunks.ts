import axios from '../../api/axiosInstance';
import { socket } from '../../api/socket';
import { messagesStart, messagesSuccess, messagesFailure, messagesSendSuccess, clearMessages } from './messagesSlice';

export const fetchAllMessage = (userId: string, chatId: string, pageNumber = 1, limit = 20) => async (dispatch: any) => {
    try {
        dispatch(messagesStart());
        const res = await axios.get(`/messages/${userId}?page=${pageNumber}&limit=${limit}`, { withCredentials: true });
        // read messages
        await axios.put(`/messages/mark-read`, { chatId: chatId }, { withCredentials: true });

        dispatch(messagesSuccess({
            messages: res.data.messages,
            chatId,
            hasMore: res.data.hasMore
        }));
    } catch (err: any) {
        dispatch(messagesFailure(err.response?.data?.message || 'Failed to fetch messages'));
    }
}

export const sendMessages = (newMessage: string, userId: string, chatId: string) => async (dispatch: any) => {

    if (!newMessage.trim()) return;

    try {
        dispatch(messagesStart());
        const res = await axios.post('/messages/send', {
            chatId: chatId,
            messageText: newMessage,
            receiverId: chatId ? undefined : userId
        });
        const sentMessage = res.data.message;
        const newChatId = res.data.chatId;

        // Emit the message to recipient via socket
        socket.emit('private-message', {
            message: sentMessage,
            to: userId // the receiver
        });

        dispatch(messagesSendSuccess({
            message: sentMessage,
            chatId: newChatId ? newChatId : chatId
        }));

        // Return the new chatId so the component can update localChatId
        return newChatId;
    } catch (err) {
        console.error('Failed to send message:', err);
    }
}

export const receiveMessage = (message: any, currentUserId: string) => async (dispatch: any) => {
    try {
        // Mark as read if not already
        if (!message.readBy?.includes(currentUserId)) {
            message.readBy.push(currentUserId);
            await axios.put(`/messages/mark-read`, {
                chatId: message.chatId
            });
        }

        dispatch(messagesSendSuccess({
            message,
            chatId: message.chatId
        }));
    } catch (err) {
        console.error('Failed to process incoming message:', err);
    }
};

export const clearAllMessages = () => async (dispatch: any) => {
    dispatch(clearMessages());
}