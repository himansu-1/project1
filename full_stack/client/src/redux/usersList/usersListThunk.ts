import { usersListStart, usersListSuccess, usersListFailure } from './usersListSlice';
import axios from '../../api/axiosInstance';

export const getUsersList = (view: string) => async (dispatch: any) => {
    try {
        dispatch(usersListStart());

        const endpoint = view === 'chats' ? '/messages/chat-users' : '/auth/users';
        const res = await axios.get(endpoint);
        const data = view === 'chats'
            ? res.data
            : res.data.map((user: any) => ({ user, chatId: null }));

        dispatch(usersListSuccess(data));
        console.log(data);
    } catch (err) {
        let errorMessage = 'Login failed. Please try again later.';
        if (err && typeof err === 'object' && 'response' in err) {
            const response = (err as any).response;
            errorMessage = response?.data?.message || errorMessage;
        }
        dispatch(usersListFailure(errorMessage));
    }
};
