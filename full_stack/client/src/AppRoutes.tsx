import { Route, Routes } from 'react-router-dom'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/messaging/ChatPage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<ChatPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes