import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerMarketplace from './pages/BuyerMarketplace';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: JSON.parse(localStorage.getItem('user') || '{}').role
    });
    const location = useLocation();

    // Re-check auth whenever the route changes
    useEffect(() => {
        setAuth({
            token: localStorage.getItem('token'),
            role: JSON.parse(localStorage.getItem('user') || '{}').role
        });
    }, [location]);

    return (
        <div className="min-h-screen bg-gray-50 uppercase-headings">
            <Navbar />
            <div className="pt-20 pb-10">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Login />} />
                    <Route
                        path="/farmer"
                        element={auth.token && auth.role === 'farmer' ? <FarmerDashboard /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/buyer"
                        element={auth.token && auth.role === 'buyer' ? <BuyerMarketplace /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/admin"
                        element={auth.token && auth.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
                    />
                </Routes>
            </div>
        </div>
    );
}

export default App;
