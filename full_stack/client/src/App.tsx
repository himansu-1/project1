import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { loadUser } from './redux/auth/authThunks';
import { socket } from './api/socket';
// import { toastMessageNotification, toastNotification } from './utils/toastNotification';
import AppRoutes from './AppRoutes';

function App() {
  const dispatch = useAppDispatch();
  const auth: any = useAppSelector((state) => state.auth);

  // useEffect(() => {
  //   dispatch(loadUser());
  // }, [dispatch]);
  useEffect(() => {
    // If user is not loaded, and there is a token, try loading the user
    if (!auth.user && auth.token && !auth.loading) {
      dispatch(loadUser());
    }
  }, [auth.user, auth.token, auth.loading, dispatch]);

  // Register user with socket once user is loaded
  useEffect(() => {
    if (auth?.user?._id) {
      // console.log('User registered with socket:', auth.user._id);

      
      socket.connect();
      socket.emit('register-user', auth.user._id);
      // Tab has focus
      const handleFocus = async () => {
        socket.emit('register-user', auth.user._id);
      }

      // Tab has lost focus or Tab closed
      const handleBlur = () => {
        if (auth?.user?._id) {
          socket.emit("offline")
        }
      };

      // Track if the user changes the tab to determine when they are online
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      const handleMessageNotification = (payload: any) => {
        switch (payload.type) {
          case 'message':
            // toastMessageNotification(payload.senderName || "Someone", payload.message.messageText);
            break;

          case 'user-registered':
            // toastNotification("User just signed up!")
            break;

          case 'login':
            // toastNotification("User just logged in!")
            break;

          default:
            console.warn('Unhandled notification type:', payload.type);
        }

      }

      socket.on('notification', handleMessageNotification);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        socket.off('notification', handleMessageNotification);
      };
    }
  }, [auth?.user?._id]);

  return (
    <AppRoutes />
  )
}

export default App