// src/components/LogoutButton.tsx
import React from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/auth/authThunks';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../api/socket';

const Logout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    socket.emit("offline")
    navigate('/login');
    socket.disconnect();
  };

  return <button onClick={handleLogout}>Log-out</button>;
};

export default Logout;
