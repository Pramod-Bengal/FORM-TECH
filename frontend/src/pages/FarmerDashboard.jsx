import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, IndianRupee, Info, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FarmerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', image: null });
    const [lastListed, setLastListed] = useState(null);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/farmer/my-products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products');
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

            const { data } = await axios.post('http://localhost:5000/api/farmer/products', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setLastListed({
                ...newProduct,
                earnings: data.earnings_per_kg
            });
            setShowAddForm(false);
            setShowReceipt(true);
            setNewProduct({ name: '', price: '', quantity: '', image: null });
            fetchMyProducts();
            fetchMyProducts();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Check backend connection';
            alert('Listing failed: ' + msg);
            console.error('Add product error:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const farmerEarnings = newProduct.price ? Math.max(0, parseFloat(newProduct.price) - 5) : 0;

    return (
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
                    <p className="text-gray-500">Manage your produce and track earnings</p>
                </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="card bg-primary-600 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <TrendingUp size={24} />
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-lg">Live Stats</span>
                    </div>
                    <p className="text-primary-100 text-sm">Total Active Listings</p>
                    <h2 className="text-4xl font-bold">{products.length}</h2>
                </div>
                <div className="card border-2 border-primary-100">
                    <p className="text-gray-500 text-sm">Standard Deduction</p>
                    <div className="flex items-center gap-2 mt-1">
                        <IndianRupee size={24} className="text-orange-500" />
                        <h2 className="text-3xl font-bold">5.00</h2>
                        <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg uppercase">Transport Fee</span>
                    </div>
                </div>
                <div className="card bg-slate-900 text-white">
                    <p className="text-slate-400 text-sm">Revenue Share</p>
                    <div className="mt-1 flex items-end gap-2">
                        <h2 className="text-3xl font-bold">85%</h2>
                        <p className="text-slate-500 text-xs mb-1 font-medium italic">Approx. after fees</p>
                    </div>
                </div>
            </div>

            <>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Package className="text-primary-600" /> Your Listed Vegetables
                    </h2>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} /> Add New Crop
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <motion.div layout key={p.id} className="card overflow-hidden !p-0">
                            <div className="h-48 bg-gray-100 relative">
                                {p.image ? (
                                    <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-gray-100">
                                        Qty: {p.quantity} kg
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ${p.status === 'approved' ? 'bg-green-50 text-green-600 ring-green-100' :
                                        p.status === 'refused' ? 'bg-red-50 text-red-600 ring-red-100' :
                                            'bg-orange-50 text-orange-600 ring-orange-100'
                                        }`}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-3">{p.name}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Market Price</span>
                                        <span className="font-semibold">₹{p.price}/kg</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-primary-600 uppercase tracking-widest font-black">Net Earnings</p>
                                            <p className="text-2xl font-black text-primary-700">₹{p.earnings}/kg</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Val.</p>
                                            <p className="text-sm font-bold text-gray-700">₹{(p.earnings * p.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </>

            {/* Modal for adding product */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddForm(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="card w-full max-w-lg z-10"
                        >
                            <h2 className="text-2xl font-bold mb-6">List Your Produce</h2>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Vegetable Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tomato, Spinach"
                                        className="input-field"
                                        required
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Quantity (kg)</label>
                                        <input
                                            type="number"
                                            placeholder="50"
                                            className="input-field"
                                            required
                                            value={newProduct.quantity}
                                            onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Market Price (₹/kg)</label>
                                        <input
                                            type="number"
                                            placeholder="35"
                                            className="input-field"
                                            required
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {newProduct.price && (
                                    <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 flex items-start gap-3">
                                        <Info className="text-primary-600 shrink-0" size={20} />
                                        <div className="text-sm w-full">
                                            <p className="text-primary-800 font-semibold mb-2">Live Price Detection</p>
                                            <div className="flex justify-between text-primary-700">
                                                <span>Listing Price:</span>
                                                <span className="font-bold">₹{newProduct.price}/kg</span>
                                            </div>
                                            <div className="flex justify-between text-orange-600 border-b border-primary-200 pb-2 mb-2">
                                                <span>Transport Deduction:</span>
                                                <span className="font-bold">- ₹5.00/kg</span>
                                            </div>
                                            <div className="flex justify-between text-primary-950 font-black text-lg">
                                                <span>Total Earnings ({newProduct.quantity || 0} kg):</span>
                                                <span>₹{(farmerEarnings * (parseFloat(newProduct.quantity) || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Quality-check Photo</label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-primary-400 transition-colors">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                                        />
                                        <div className="text-center">
                                            {newProduct.image ? (
                                                <p className="text-primary-600 font-bold">{newProduct.image.name}</p>
                                            ) : (
                                                <p className="text-gray-400">Click to upload quality check photo</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 btn-primary">
                                        {loading ? 'Processing...' : 'Confirm Listing'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Receipt / Bill Modal */}
                {showReceipt && lastListed && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl z-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary-500" />
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800">Crop Listed!</h2>
                                <p className="text-gray-400 text-sm">Listing ID: #{Math.floor(Math.random() * 90000) + 10000}</p>
                            </div>

                            <div className="space-y-4 border-y-2 border-dashed border-gray-100 py-6 my-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium italic">Vegetable</span>
                                    <span className="font-bold text-slate-800 uppercase">{lastListed.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium italic">Quantity</span>
                                    <span className="font-bold text-slate-800">{lastListed.quantity} kg</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium italic">Listing Price</span>
                                    <span className="font-bold text-slate-800">₹{lastListed.price}/kg</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-orange-600">
                                    <span className="font-medium italic">Transport Charge</span>
                                    <span className="font-black">- ₹5.00</span>
                                </div>
                            </div>

                            <div className="bg-primary-50 p-4 rounded-2xl text-center">
                                <p className="text-[10px] text-primary-600 uppercase tracking-widest font-black mb-1">Your Earnings</p>
                                <p className="text-4xl font-black text-primary-700">₹{lastListed.earnings}<span className="text-sm font-normal">/kg</span></p>
                            </div>

                            <button
                                onClick={() => setShowReceipt(false)}
                                className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Done
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmerDashboard;
