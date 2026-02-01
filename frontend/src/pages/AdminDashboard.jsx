import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, XCircle, TrendingUp, Users, Package, ShoppingBag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [pendingProducts, setPendingProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('moderation');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, statsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/pending-products`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPendingProducts(productsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data');
        }
    };

    const handleAction = async (productId, action) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/product-action`,
                { product_id: productId, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            alert('Action failed');
        }
    };

    if (!stats) return <div className="flex items-center justify-center h-screen">Loading Mediator Control Panel...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 font-['Outfit'] italic tracking-tight">MEDIATOR CONTROL PANEL</h1>
                    <p className="text-gray-500 font-medium">Overseeing agricultural trade & logistics</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl ring-1 ring-gray-200">
                    <button
                        onClick={() => setActiveTab('moderation')}
                        className={`px-6 py-2.5 rounded-xl transition-all font-black text-xs tracking-widest ${activeTab === 'moderation' ? 'bg-white shadow-xl text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        MODERATION
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-6 py-2.5 rounded-xl transition-all font-black text-xs tracking-widest ${activeTab === 'activity' ? 'bg-white shadow-xl text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        GLOBAL ACTIVITY
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="card !bg-slate-900 border-none group">
                    <TrendingUp className="text-primary-400 mb-4 group-hover:scale-110 transition-transform" size={28} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Savings</p>
                    <p className="text-3xl font-black text-white font-['Outfit'] italic">₹{stats.total_savings.toLocaleString()}</p>
                    <p className="text-[10px] text-primary-400 font-bold mt-1">LOGISTICS FEE (₹5/KG)</p>
                </div>
                <div className="card">
                    <Users className="text-blue-500 mb-4" size={28} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trade Network</p>
                    <p className="text-2xl font-black text-slate-800 font-['Outfit'] italic">{stats.total_farmers} Farmers · {stats.total_buyers} Buyers</p>
                </div>
                <div className="card">
                    <ShoppingBag className="text-orange-500 mb-4" size={28} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Volume</p>
                    <p className="text-2xl font-black text-slate-800 font-['Outfit'] italic">₹{stats.total_revenue.toLocaleString()}</p>
                </div>
                <div className="card">
                    <Clock className="text-purple-500 mb-4" size={28} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Verification</p>
                    <p className="text-2xl font-black text-slate-800 font-['Outfit'] italic">{pendingProducts.length}</p>
                </div>
            </div>

            {activeTab === 'moderation' ? (
                <div>
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Package className="text-primary-600" /> CROP VERIFICATION QUEUE
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pendingProducts.map(p => (
                            <motion.div layout key={p.id} className="card p-0 overflow-hidden group">
                                <div className="h-56 bg-gray-100 relative">
                                    {p.image ? (
                                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.image}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No Reference Photo</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <div className="text-white">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Farmer: {p.farmer_name}</p>
                                            <h3 className="text-2xl font-black italic">{p.name}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Farmer Base</p>
                                            <p className="text-xl font-bold text-slate-700">₹{p.base_price}/kg</p>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-100 rotate-12"></div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Buyer Final</p>
                                            <p className="text-2xl font-black text-primary-700 italic">₹{p.final_price}/kg</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAction(p.id, 'refused')}
                                            className="flex-1 py-3 rounded-xl border-2 border-red-50 text-red-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                                        >
                                            <XCircle size={16} /> Refuse
                                        </button>
                                        <button
                                            onClick={() => handleAction(p.id, 'approved')}
                                            className="flex-1 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary-100 transition-all"
                                        >
                                            <ShieldCheck size={16} /> Approve
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {pendingProducts.length === 0 && (
                        <div className="p-32 text-center card bg-gray-50/50 border-dashed border-2">
                            <ShieldCheck className="mx-auto text-gray-200 mb-4" size={64} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest italic">Verification queue is clear</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card !p-0 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 italic">
                            LIVE NETWORK FEED
                        </h2>
                    </div>
                    <div className="p-4">
                        {stats.recent_activity.map((act, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${act.type === 'order' ? 'bg-primary-100 text-primary-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {act.type === 'order' ? <ShoppingBag size={20} /> : <Package size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800">{act.detail}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{act.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${act.type === 'order' ? 'text-primary-600' : 'text-blue-500'}`}>{act.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
