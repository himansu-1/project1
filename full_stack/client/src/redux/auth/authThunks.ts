// src/redux/auth/authThunks.js
import { signInWithPopup } from 'firebase/auth';
import axios from '../../api/axiosInstance';
import { socket } from '../../api/socket';
import { toBase64 } from '../../utils/toBase64';
import type { AppDispatch } from '../store';
import { authStart, authSuccess, authFailure, logoutUser } from './authSlice';
import { auth, googleProvider } from '../../utils/firebase';

export const loginUser = (credentials: { email: string; password: string }) => async (dispatch: any) => {
    try {
        dispatch(authStart());
        const res = await axios.post('auth/login', credentials, { withCredentials: true });
        dispatch(authSuccess(res.data));
        socket.connect();
    } catch (err) {
        let errorMessage = 'Login failed. Please try again later.';
        if (err && typeof err === 'object' && 'response' in err) {
            const response = (err as any).response;
            errorMessage = response?.data?.message || errorMessage;
        }
        dispatch(authFailure(errorMessage));
    }
};

export const registerUser = (formData: {
    name: string;
    email: string;
    password: string;
    profile_image?: File;
}) => async (dispatch: (arg0: { payload: any; type: "auth/authStart" | "auth/authSuccess" | "auth/authFailure"; }) => void) => {

    try {
        dispatch(authStart());

        let imageBase64 = '';
        if (formData.profile_image) {
            imageBase64 = await toBase64(formData.profile_image);
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            image: imageBase64, // optional
        };

        const res = await axios.post('auth/register', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });

        dispatch(authSuccess(res.data));
        socket.connect();
    } catch (err) {
        dispatch(authFailure("Registration failed"));
    }
};

export const logout = () => async (dispatch: (arg0: { payload: undefined; type: "auth/logoutUser"; }) => void) => {
    await axios.post('auth/logout', {}, { withCredentials: true });
    dispatch(logoutUser());
};

export const loadUser = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(authStart());
        const res = await axios.get('/auth/me', { withCredentials: true });
        dispatch(authSuccess(res.data));
    } catch (err: any) {
        dispatch(authFailure(err.response?.data?.message || 'Session expired'));
    }
};

export const googleLogin = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(authStart());

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken(); // 🔐
        
        // Send to backend to register or login
        const res = await axios.post('/auth/google-login',
            {}, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            withCredentials: true
        });
    
        dispatch(authSuccess(res.data));
        socket.connect(); // optional
    } catch (err: any) {
        console.error('Google login error:', err);
        dispatch(authFailure(err.response?.data?.message));
        
    }
};
