import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error('Registration failed: ' + (err.response?.data?.msg || 'Error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen pt-24 pb-12 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-500">Join our sustainable marketplace</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="input-field pl-12"
                            required
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="input-field pl-12"
                            required
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field pl-12"
                            required
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'farmer' })}
                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-semibold ${formData.role === 'farmer' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-500'}`}
                        >
                            I'm a Farmer
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'buyer' })}
                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-semibold ${formData.role === 'buyer' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-500'}`}
                        >
                            I'm a Buyer
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
