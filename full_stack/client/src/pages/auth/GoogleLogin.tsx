import { useAppDispatch } from '../../redux/hooks';
import { googleLogin } from '../../redux/auth/authThunks';

function GoogleLogin() {
    const dispatch = useAppDispatch();

    const handleGoogleLogin = () => {
        dispatch(googleLogin());
    }

    return (
        <div onClick={handleGoogleLogin} style={{ cursor: 'pointer' }}>GoogleLogin</div>
    )
}

export default GoogleLogin