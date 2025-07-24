// src/components/auth/Login.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser } from '../../redux/auth/authThunks';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const { isAuthenticated } = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth);
  // isAuthenticated ? redirect('/dashboard') : console.log('not authenticated');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(credentials)); // ✅ This will now work
  };

  useEffect(() => {
    if (isAuthenticated) {
      // console.log("user login then redirecting to dashboard page");

      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        />
        <input
          type="d"
          placeholder="Password"
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <button type="submit" disabled={loading}>Login</button>
        {error && <p>{error}</p>}
      </form>
      {/* google login */}
      <GoogleLogin />
    </>
  );
};

export default Login;
