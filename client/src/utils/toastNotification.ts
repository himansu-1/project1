import { toast } from 'react-toastify';
import icon from '../../public/vite.png'
import { playNotificationSound } from './playNotificationSound';

export const toastNotification = (message: string) => {
    toast(message);
};

export const toastMessageNotification = (senderName: string, message: string) => {
    const isTabFocused = document.hasFocus();

    if (Notification.permission === "granted") {
        if (!isTabFocused) {
            const notification = new Notification(senderName || "New Message", {
                body: message,
                icon: icon,
                tag: "chat-message", // Avoids stacking duplicates
                // requireInteraction: true, // Stays until clicked
            });
            // Play sound
            playNotificationSound();
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    } else {
        // Ask only if the user hasn't decided yet
        Notification.requestPermission().then((permission) => {
            if (permission === "denied") {
                console.warn("User denied notifications.");
            }
        });
    }
    toast(`${senderName}: ${message}`, {
        position: "top-right",
        autoClose: 4000,
        pauseOnHover: true,
        theme: "light",
    });
};