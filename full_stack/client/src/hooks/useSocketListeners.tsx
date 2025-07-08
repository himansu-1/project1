// hooks/useSocketListeners.ts
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    incrementUnreadForUser,
    moveUserToTop
} from "../redux/usersList/usersListSlice";
import { receiveMessage } from "../redux/messages/messagesThunks";

import { socket } from "../api/socket"; // Adjust path as needed

export const useSocketListeners = () => {
    const dispatch = useAppDispatch();
    const auth: any = useAppSelector((state) => state.auth);
    const selectedChat = useAppSelector((state) => state.chat.selectedChat);
    const hasInitializedRef = useRef(false);    
    
    useEffect(() => {
        
        if (!hasInitializedRef.current) return;
        hasInitializedRef.current = true;
        if (!auth?.isAuthenticated) return;
        const handleReceiveMessage = (data: any) => {
            console.log("📩 Message received in hook:", data);
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
};
