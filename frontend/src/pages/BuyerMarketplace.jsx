import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Filter, ShieldCheck, History, LayoutDashboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BuyerMarketplace = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('market'); // 'market' or 'orders'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProducts();
        if (token) fetchOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/buyer/products');
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products');
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/buyer/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders');
        }
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            alert("Please login as a buyer to place an order");
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/buyer/order', {
                product_id: selectedProduct.id,
                quantity: orderQuantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Order placed successfully!');
            setSelectedProduct(null);
            fetchProducts();
            fetchOrders();
        } catch (err) {
            alert('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = selectedProduct ? (orderQuantity * selectedProduct.price) : 0;

    return (
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Buyer Dashboard</h1>
                    <p className="text-gray-500">Fresh produce delivered to your doorstep</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold ${activeTab === 'market' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutDashboard size={18} /> Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold ${activeTab === 'orders' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <History size={18} /> My Orders
                    </button>
                </div>
            </div>

            {activeTab === 'market' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search fresh vegetables..." className="input-field pl-12" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-white transition-all font-semibold text-gray-600">
                            <Filter size={18} /> Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <motion.div
                                key={p.id}
                                layoutId={`prod-${p.id}`}
                                className="card group cursor-pointer"
                                onClick={() => { setSelectedProduct(p); setOrderQuantity(1); }}
                            >
                                <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                    {p.image ? (
                                        <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No Photo</div>
                                    )}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter shadow-sm flex items-center gap-1">
                                            <ShieldCheck size={12} className="text-primary-600" /> Quality Checked
                                        </span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                                <p className="text-sm text-gray-500 mb-3 italic">From {p.farmer_name}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-black text-primary-700">₹{p.price}/kg</span>
                                    <button className="p-2 bg-primary-100 text-primary-700 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="card !p-0 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Seller</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Paid</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{order.product_name}</p>
                                        <p className="text-xs text-gray-400 uppercase font-medium">{order.date}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">{order.farmer_name}</td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-700">{order.quantity} kg</td>
                                    <td className="px-6 py-4 text-right font-black text-primary-700">₹{order.total_price}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase ring-1 ring-green-100">
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-20 text-center">
                            <History className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-medium">No orders found yet</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`prod-${selectedProduct.id}`}
                            className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden z-10 shadow-2xl flex flex-col md:flex-row relative"
                        >
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full text-slate-800 hover:bg-white transition-all shadow-md">
                                <X size={20} />
                            </button>
                            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
                                {selectedProduct.image ? (
                                    <img src={`http://localhost:5000${selectedProduct.image}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center italic text-gray-400">No Photo</div>
                                )}
                            </div>
                            <div className="p-8 w-full md:w-1/2 flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">Verified Farm</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-1">{selectedProduct.name}</h2>
                                    <p className="text-gray-500 text-sm mb-6 flex items-center gap-1 italic">Sold by <span className="font-bold text-gray-700 not-italic underline decoration-primary-300 text-base">{selectedProduct.farmer_name}</span></p>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Price</p>
                                            <p className="text-3xl font-black text-primary-600 font-['Outfit'] italic underline">₹{selectedProduct.price}/kg</p>
                                        </div>
                                        <div className="h-10 w-[2px] bg-gray-100 rotate-12"></div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">In Stock</p>
                                            <p className="text-xl font-bold text-slate-700">{selectedProduct.quantity} kg</p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3">Adjust Quantity (kg)</label>
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl w-fit ring-1 ring-gray-100">
                                            <button
                                                onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                                                className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:scale-105 transition-all text-slate-800 font-bold"
                                            >-</button>
                                            <span className="text-xl font-black w-14 text-center text-slate-800">{orderQuantity}</span>
                                            <button
                                                onClick={() => setOrderQuantity(prev => Math.min(selectedProduct.quantity, prev + 1))}
                                                className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:scale-105 transition-all text-slate-800 font-bold"
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50/50 p-6 rounded-[1.5rem] border border-orange-100 mb-8 shadow-sm">
                                        <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-4">Final Billing (Breakdown)</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-orange-700 italic">Net Produce (₹{selectedProduct.price - 5}/kg)</span>
                                                <span className="font-bold text-slate-800">₹{(selectedProduct.price - 5) * orderQuantity}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-orange-700 italic">Logistics Fee (₹5/kg)</span>
                                                <span className="font-bold text-slate-800">+ ₹{5 * orderQuantity}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-orange-200/50">
                                                <span className="text-xs font-black text-orange-900 uppercase">Grand Total Due</span>
                                                <span className="text-2xl font-black text-orange-950 font-['Outfit'] italic">₹{totalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-100 active:scale-95"
                                    >
                                        {loading ? 'Processing...' : <><ShoppingCart size={20} /> Secure Checkout</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuyerMarketplace;
