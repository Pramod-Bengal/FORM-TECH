import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, IndianRupee, Info, TrendingUp, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', image: null });
    const [qualityAnalysis, setQualityAnalysis] = useState({ loading: false, result: null });
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'https://form-tech-backend.onrender.com';

    useEffect(() => { fetchMyProducts(); }, []);

    const fetchMyProducts = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/farmer/my-products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(data);
        } catch (err) { console.error('Failed to fetch products'); }
    };

    const checkQuality = async (file) => {
        if (!file || !newProduct.name) {
            toast.error("Please enter specific vegetable name and select image first");
            return;
        }

        setQualityAnalysis({ loading: true, result: null });
        const formData = new FormData();
        formData.append('image', file);
        formData.append('vegetable_name', newProduct.name);

        try {
            const { data } = await axios.post(`${API_URL}/api/farmer/analyze-quality`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Artificial delay for "AI thinking" effect
            setTimeout(() => {
                setQualityAnalysis({ loading: false, result: data });
                toast.success(`Quality Graded: ${data.grade}`);
            }, 1000);

        } catch (err) {
            setQualityAnalysis({ loading: false, result: null });
            toast.error("Quality analysis failed");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('vegetable_name', newProduct.name);
            formData.append('price', newProduct.price);
            formData.append('quantity', newProduct.quantity);
            if (newProduct.image) formData.append('image', newProduct.image);

            if (qualityAnalysis.result) {
                formData.append('quality_score', qualityAnalysis.result.score);
            }

            await axios.post(`${API_URL}/api/farmer/products`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setShowAddForm(false);
            setNewProduct({ name: '', price: '', quantity: '', image: null });
            setQualityAnalysis({ loading: false, result: null });
            fetchMyProducts();
            toast.success('Product listed successfully!');
        } catch (err) { toast.error('Listing failed: ' + (err.response?.data?.msg || 'Error')); }
        finally { setLoading(false); }
    };

    const farmerEarnings = newProduct.price ? Math.max(0, parseFloat(newProduct.price) - 5) : 0;

    return (
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
                    <p className="text-gray-500">Manage your produce</p>
                </div>
                <button onClick={() => setShowAddForm(true)} className="w-full md:w-auto bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-200">
                    <Plus size={20} /> Add Crop
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-10">No products listed yet.</p> :
                    products.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-40 bg-gray-100 relative">
                                {p.image ? <img src={`${API_URL}${p.image}`} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">No Img</div>}
                                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'refused' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg">{p.name}</h3>
                                <p className="text-sm text-gray-500">{p.quantity}kg • ₹{p.price}/kg</p>
                                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between">
                                    <span className="text-xs text-primary-600 font-bold uppercase">Net Earnings</span>
                                    <span className="font-bold text-primary-700">₹{p.earnings}/kg</span>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                            <h2 className="text-2xl font-bold mb-6">List Produce</h2>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <input type="text" placeholder="Vegetable Name (e.g. Tomato)" className="w-full input-field border p-2 rounded-lg" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Qty (kg)" className="input-field border p-2 rounded-lg" required value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} />
                                    <input type="number" placeholder="Price (₹/kg)" className="input-field border p-2 rounded-lg" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                </div>
                                {newProduct.price && newProduct.quantity && (
                                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Price per kg:</span>
                                            <span className="font-bold">₹{newProduct.price}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-red-500">
                                            <span>Platform Fee (15%):</span>
                                            <span>-₹{(newProduct.price * 0.15).toFixed(2)}/kg</span>
                                        </div>
                                        <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-green-700">
                                            <span>Net Earning/kg:</span>
                                            <span>₹{(newProduct.price * 0.85).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between bg-white/50 p-2 rounded border border-blue-100 mt-1">
                                            <span className="font-bold text-blue-900">Total Net Earning:</span>
                                            <span className="font-bold text-xl text-blue-700">₹{(newProduct.price * 0.85 * newProduct.quantity).toFixed(0)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="border border-dashed p-4 rounded-lg text-center relative hover:bg-gray-50 transition-colors">
                                    <input type="file" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={e => {
                                        const file = e.target.files[0];
                                        setNewProduct({ ...newProduct, image: file });
                                        // Optionally auto-trigger analysis or let user click button
                                    }} />
                                    <span className="text-sm text-gray-500">{newProduct.image ? newProduct.image.name : "Upload Photo for AI Analysis"}</span>
                                </div>

                                {/* AI Analysis Section */}
                                {newProduct.image && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                <Scan size={18} className="text-primary-600" /> AI Verification (Google-Standard)
                                            </h3>
                                            {!qualityAnalysis.result && !qualityAnalysis.loading && (
                                                <button
                                                    type="button"
                                                    onClick={() => checkQuality(newProduct.image)}
                                                    className="text-xs bg-slate-900 text-white px-3 py-1 rounded-lg hover:bg-slate-800"
                                                >
                                                    Verify & Analyze
                                                </button>
                                            )}
                                        </div>

                                        {qualityAnalysis.loading && (
                                            <div className="text-center py-2">
                                                <div className="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-1"></div>
                                                <p className="text-xs text-gray-500">Scanning pixels...</p>
                                            </div>
                                        )}

                                        {qualityAnalysis.result && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-gray-500">Quality Score</span>
                                                    <span className="font-bold text-2xl text-primary-700">{qualityAnalysis.result.score}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${qualityAnalysis.result.score}%` }}></div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold">{qualityAnalysis.result.grade}</span>
                                                    <span className="text-[10px] text-gray-400">Google Ref. Match</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 italic border-t pt-2 border-gray-100">
                                                    "{qualityAnalysis.result.analysis}"
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700">{loading ? 'Saving...' : 'List Produce'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmerDashboard;
