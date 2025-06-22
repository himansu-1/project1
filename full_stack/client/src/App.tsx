import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './pages/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { useEffect } from 'react';
import Layout from './pages/Layout';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { loadUser } from './redux/auth/authThunks';
import ChatPage from './pages/messaging/ChatPage';
import { socket } from './api/socket';
import { toastMessageNotification, toastNotification } from './utils/toastNotification';

const ProtectedDashboard = ProtectedRoute(Dashboard);
const ProtectedChatPage = ProtectedRoute(ChatPage);

function App() {
  const dispatch = useAppDispatch();
  const auth: any = useAppSelector((state) => state.auth);


  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Register user with socket once user is loaded
  useEffect(() => {
    if (auth?.user?._id) {
      // console.log('User registered with socket:', auth.user._id);
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
            toastMessageNotification(payload.senderName || "Someone", payload.message.messageText);
            break;

          case 'user-registered':
            toastNotification("User just signed up!")
            break;

          case 'login':
            toastNotification("User just logged in!")
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
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/users" element={<ProtectedChatPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Routes>
  )
}

export default App