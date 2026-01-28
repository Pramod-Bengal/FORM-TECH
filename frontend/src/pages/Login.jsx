import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, User, UserCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'login') {
                const { data } = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }));

                if (data.role === 'farmer') navigate('/farmer');
                else if (data.role === 'admin') navigate('/admin');
                else navigate('/buyer');
            } else {
                await axios.post('http://localhost:5000/api/auth/register', formData);
                alert('Account created! Please sign in.');
                setMode('login');
            }
        } catch (err) {
            alert((mode === 'login' ? 'Login' : 'Signup') + ' failed: ' + (err.response?.data?.msg || 'Verification failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-120px)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Mode Switcher */}
                <div className="flex bg-gray-200/50 backdrop-blur-md p-1.5 rounded-[1.5rem] mb-8 relative z-10 w-fit mx-auto ring-1 ring-gray-200">
                    <button
                        onClick={() => setMode('login')}
                        className={`px-8 py-2.5 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'login' ? 'bg-white text-primary-600 shadow-xl shadow-primary-100 ring-1 ring-primary-50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        SIGN IN
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`px-8 py-2.5 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'signup' ? 'bg-white text-primary-600 shadow-xl shadow-primary-100 ring-1 ring-primary-50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        NEW ACCOUNT
                    </button>
                </div>

                <div className="card relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-100/30 rounded-full blur-3xl group-hover:bg-primary-200/40 transition-colors duration-700" />

                    <div className="relative">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-slate-800 font-['Outfit'] italic tracking-tight">
                                {mode === 'login' ? 'WELCOME BACK' : 'JOIN THE MISSION'}
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 font-medium">
                                {mode === 'login' ? 'Access your dashboard and listings' : 'Start your journey in agriculture tech'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        key="name"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Legal Full Name"
                                                className="input-field pl-12 ring-inset focus:scale-[1.01]"
                                                required={mode === 'signup'}
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="input-field pl-12 focus:scale-[1.01]"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field pl-12 focus:scale-[1.01]"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        key="role"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Select Your Profile Type</p>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                                className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 ${formData.role === 'farmer' ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg shadow-primary-50' : 'border-gray-50 text-gray-400 grayscale hover:grayscale-0 hover:bg-gray-50'}`}
                                            >
                                                <span>FARMER</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${formData.role === 'farmer' ? 'bg-primary-600' : 'bg-transparent'}`} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                                className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 ${formData.role === 'buyer' ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg shadow-primary-50' : 'border-gray-50 text-gray-400 grayscale hover:grayscale-0 hover:bg-gray-50'}`}
                                            >
                                                <span>BUYER</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${formData.role === 'buyer' ? 'bg-primary-600' : 'bg-transparent'}`} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-primary-600 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-200 active:scale-95 disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? <LogIn size={20} /> : <UserCheck size={20} />}
                                        {mode === 'login' ? 'AUTHENTICATE' : 'INITIALIZE ACCOUNT'}
                                        <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
