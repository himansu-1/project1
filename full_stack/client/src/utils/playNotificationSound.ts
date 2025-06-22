export const playNotificationSound = () => {
    const audio = new Audio('../../public/notification.mp3');
    audio.volume = 0.8; // adjust volume
    audio.play().catch((err) => {
        console.warn('Failed to play notification sound:', err);
    });
};
