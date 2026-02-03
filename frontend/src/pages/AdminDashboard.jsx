import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, CheckCircle, XCircle, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, transactions
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchStats();
        fetchPending();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'transactions') fetchTransactions();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    const fetchPending = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/admin/pending-products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingProducts(data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data);
        } catch (err) { toast.error("Failed to load users"); }
    };

    const fetchTransactions = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(data);
        } catch (err) { toast.error("Failed to load transactions"); }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.post(`${API_URL}/api/admin/product-action`,
                { product_id: id, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Product ${action} successfully`);
            fetchPending();
            fetchStats();
        } catch (err) { toast.error('Action failed'); }
    };

    if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-primary-600" /> Admin Dashboard
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                {['overview', 'users', 'transactions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 font-bold capitalize transition-colors ${activeTab === tab
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <StatCard icon={<Users />} label="Total Farmers" value={stats.total_farmers} color="bg-blue-500" />
                        <StatCard icon={<ShoppingBag />} label="Total Buyers" value={stats.total_buyers} color="bg-purple-500" />
                        <StatCard icon={<Package />} label="Products Listed" value={stats.total_products} color="bg-orange-500" />
                        <StatCard icon={<TrendingUp />} label="Total Revenue" value={`₹${stats.total_revenue}`} color="bg-green-600" />
                    </div>

                    <div className="mb-12">
                        <h2 className="text-xl font-bold mb-4">Pending Approvals ({pendingProducts.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingProducts.length === 0 ? <p className="text-gray-400">No pending products.</p> :
                                pendingProducts.map(p => (
                                    <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            {p.image ? <img src={`${API_URL}${p.image}`} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs">No Img</div>}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{p.name}</h3>
                                            <p className="text-sm text-gray-500">By: {p.farmer_name}</p>
                                            <p className="text-sm font-semibold mt-1">₹{p.final_price}/kg • {p.quantity}kg</p>
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => handleAction(p.id, 'approved')} className="flex-1 bg-green-50 text-green-700 py-1 rounded-lg text-sm font-bold hover:bg-green-100">Approve</button>
                                                <button onClick={() => handleAction(p.id, 'refused')} className="flex-1 bg-red-50 text-red-700 py-1 rounded-lg text-sm font-bold hover:bg-red-100">Refuse</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4">Recent Network Activity</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                            {stats.recent_activity.map((act, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-800">{act.detail}</p>
                                        <p className="text-xs text-gray-400">{act.date}</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary-600">{act.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <h2 className="text-xl font-bold mb-4">User Directory</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{u.name}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'farmer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{u.role.toUpperCase()}</span></td>
                                        <td className="p-4 text-gray-500">{u.email}</td>
                                        <td className="p-4 text-gray-400 text-sm">{u.joined}</td>
                                        <td className="p-4 text-sm">
                                            {u.role === 'farmer' ?
                                                <span>{u.stats.listings} Listings ({u.stats.listings_active} Active)</span> :
                                                <span>{u.stats.orders_placed} Orders (₹{u.stats.total_spent})</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Buyer</th>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Farmer</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-gray-500 text-sm">{t.date}</td>
                                        <td className="p-4 font-medium">{t.buyer}</td>
                                        <td className="p-4">{t.quantity}kg {t.product}</td>
                                        <td className="p-4 text-gray-600">{t.farmer}</td>
                                        <td className="p-4 font-bold text-green-600">₹{t.amount}</td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">{t.payment_method}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
        <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg">{icon}</div>
        </div>
        <p className="text-white/80 text-sm">{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
    </div>
);

export default AdminDashboard;
