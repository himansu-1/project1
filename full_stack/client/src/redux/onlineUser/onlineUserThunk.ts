import { onlineUserStart, onlineUserSuccess, onlineUserFailure } from './onlineUserSlice';
import { socket } from '../../api/socket';

export const getOnlineUsersList = () => async (dispatch: any) => {
    try {
        dispatch(onlineUserStart());
        socket.on("online-users", (userIds: string[]) => {
            dispatch(onlineUserSuccess(userIds));
        });
    } catch (err) {
        let errorMessage = 'Login failed. Please try again later.';
        if (err && typeof err === 'object' && 'response' in err) {
            const response = (err as any).response;
            errorMessage = response?.data?.message || errorMessage;
        }
        dispatch(onlineUserFailure(errorMessage));
    }
};
