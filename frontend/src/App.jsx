import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

function App() {
    // Simple route protection
    const ProtectedRoute = ({ children, allowedRole }) => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token) return <Navigate to="/login" />;
        if (allowedRole && role !== allowedRole) return <Navigate to="/login" />;

        return children;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Toaster position="top-right" />
            <Navbar />
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard/farmer" element={
                    <ProtectedRoute allowedRole="farmer"><FarmerDashboard /></ProtectedRoute>
                } />

                <Route path="/dashboard/buyer" element={
                    <ProtectedRoute allowedRole="buyer"><BuyerDashboard /></ProtectedRoute>
                } />

                <Route path="/dashboard/admin" element={
                    <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
                } />
            </Routes>
        </div>
    );
}

export default App;
