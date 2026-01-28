import { useNavigate, Link } from 'react-router-dom';
import { Leaf, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 border-b border-gray-100 flex items-center px-6 justify-between">
            <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'farmer' ? '/farmer' : user?.role === 'buyer' ? '/buyer' : '/'}
                className="flex items-center gap-2 group"
            >
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform">
                    <Leaf size={24} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    AgricultureApp
                </span>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold">{user.name}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{user.role}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="text-sm font-medium hover:text-primary-600 px-4 py-2 transition-colors">Login</Link>
                        <Link to="/register" className="btn-primary text-sm">Join Now</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
