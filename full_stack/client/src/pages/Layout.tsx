import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet } from 'react-router-dom'
import { logoutUser } from '../redux/auth/authSlice';
import Logout from './auth/Logout';
import { useAppSelector } from '../redux/hooks';

function Layout() {
    const { isAuthenticated } = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth);

    const auth: any = useAppSelector((state) => state.auth)

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", position: "relative" }}>
                Layout
                {
                    isAuthenticated ?
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/users">Users</Link>
                            <Logout />
                            {
                                auth?.user ?
                                    <>
                                        <div style={{ position: "absolute", right: "10px" }}>
                                            {auth?.user?.name}
                                        </div>
                                    </> :
                                    null
                            }
                        </> :
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                }
            </div>
            <Outlet />
        </>
    )
}

export default Layout