import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BuyerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderModal, setOrderModal] = useState(null);
    const [qty, setQty] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentStep, setPaymentStep] = useState('initial'); // initial, processing, success
    const [upiId, setUpiId] = useState('');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
    const [selectedBank, setSelectedBank] = useState('');
    const [address, setAddress] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'https://form-tech-backend.onrender.com';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/buyer/products`);
            setProducts(data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    const processPaymentAndOrder = async () => {
        setPaymentStep('processing');

        // Simulate Payment Gateway Delay for non-cash methods
        if (paymentMethod !== 'Cash') {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
            await axios.post(`${API_URL}/api/buyer/order`,
                {
                    product_id: orderModal.id,
                    quantity: parseFloat(qty),
                    payment_method: paymentMethod === 'NetBanking' ? `NetBanking - ${selectedBank}` : paymentMethod,
                    delivery_address: address
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentStep('success');
            setTimeout(() => {
                setOrderModal(null);
                setPaymentStep('initial');
                setAddress('');
                setUpiId('');
                setCardDetails({ number: '', expiry: '', cvv: '' });
                fetchProducts();
                toast.success('Order Placed Successfully!');
            }, 2000);
        } catch (err) {
            setPaymentStep('initial');
            toast.error('Order failed: ' + (err.response?.data?.msg || 'Error'));
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!address.trim()) return toast.error("Please enter delivery address");

        if (paymentMethod === 'UPI' && !upiId.includes('@')) return toast.error("Enter valid UPI ID");
        if (paymentMethod === 'Card' && cardDetails.number.length < 16) return toast.error("Enter valid Card Number");
        if (paymentMethod === 'NetBanking' && (!selectedBank || selectedBank === 'Select Bank')) return toast.error("Please select a bank");

        processPaymentAndOrder();
    };

    // Filter products based on search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pb-8 pt-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Buyer Marketplace</h1>
                    <p className="text-gray-500">Fresh produce directly from farmers</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search vegetables..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <div className="text-center py-20">Loading Fresh Produce...</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-400">No vegetables found matching "{searchTerm}"</div>
                    ) : (
                        filteredProducts.map(p => (
                            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {p.image ? (
                                        <img src={p.image.startsWith('data:') || p.image.startsWith('http') ? p.image : `${API_URL}${p.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">Fresh {p.name}</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{p.name}</h3>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">₹{p.price}/kg</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Farmer: {p.farmer_name}</p>
                                    <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                                        <span className="text-xs font-medium text-gray-400">{p.quantity}kg available</span>
                                        <button
                                            onClick={() => { setOrderModal(p); setQty(1); setPaymentStep('initial'); }}
                                            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                                        >
                                            <ShoppingBag size={16} /> Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Order Modal */}
            {orderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        {paymentStep === 'initial' && (
                            <>
                                <h2 className="text-xl font-bold mb-4">Confirm Order</h2>
                                <div className="mb-4">
                                    <p className="text-gray-600">Buying <span className="font-bold text-black">{orderModal.name}</span></p>
                                    <p className="text-sm text-gray-400">Price: ₹{orderModal.price}/kg</p>
                                </div>
                                <label className="block text-sm font-bold mb-2">Quantity (kg)</label>
                                <input
                                    type="number"
                                    value={qty}
                                    onChange={e => setQty(e.target.value)}
                                    max={orderModal.quantity}
                                    min="1"
                                    className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-bold text-xl text-primary-600">₹{(qty * orderModal.price).toFixed(2)}</span>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold mb-2">Delivery Address</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                        rows="2"
                                        placeholder="Enter full delivery address..."
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold mb-2">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <label className={`flex items-center gap-2 cursor-pointer border p-2 rounded-lg ${paymentMethod === 'UPI' ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={e => setPaymentMethod(e.target.value)} /> UPI
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer border p-2 rounded-lg ${paymentMethod === 'GPay' ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="payment" value="GPay" checked={paymentMethod === 'GPay'} onChange={e => setPaymentMethod(e.target.value)} /> GPay
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer border p-2 rounded-lg ${paymentMethod === 'Card' ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={e => setPaymentMethod(e.target.value)} /> Card
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer border p-2 rounded-lg ${paymentMethod === 'NetBanking' ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="payment" value="NetBanking" checked={paymentMethod === 'NetBanking'} onChange={e => setPaymentMethod(e.target.value)} /> Net Banking
                                        </label>
                                        <label className={`col-span-2 flex items-center gap-2 cursor-pointer border p-2 rounded-lg ${paymentMethod === 'Cash' ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="payment" value="Cash" checked={paymentMethod === 'Cash'} onChange={e => setPaymentMethod(e.target.value)} /> Cash on Delivery
                                        </label>
                                    </div>

                                    {/* Conditional Inputs */}
                                    {paymentMethod === 'UPI' && (
                                        <input
                                            type="text"
                                            placeholder="Enter UPI ID (e.g. user@okaxis)"
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                        />
                                    )}
                                    {paymentMethod === 'GPay' && (
                                        <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Securely pay with Google Pay</p>
                                            <button onClick={handleNextStep} className="w-full bg-black text-white py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-blue-400 font-bold">G</span>
                                                    <span className="text-red-400 font-bold">P</span>
                                                    <span className="text-yellow-400 font-bold">a</span>
                                                    <span className="text-green-400 font-bold">y</span>
                                                </div>
                                                Pay Now
                                            </button>
                                        </div>
                                    )}
                                    {paymentMethod === 'NetBanking' && (
                                        <select
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={selectedBank}
                                            onChange={e => setSelectedBank(e.target.value)}
                                        >
                                            <option>Select Bank</option>
                                            <option>State Bank of India</option>
                                            <option>HDFC Bank</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                        </select>
                                    )}
                                    {paymentMethod === 'Card' && (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Card Number"
                                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={cardDetails.number}
                                                maxLength="16"
                                                onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    className="w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    value={cardDetails.expiry}
                                                    onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="CVV"
                                                    className="w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    value={cardDetails.cvv}
                                                    maxLength="3"
                                                    onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setOrderModal(null)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    {paymentMethod !== 'GPay' && (
                                        <button onClick={handleNextStep} className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700">
                                            {paymentMethod === 'Cash' ? 'Confirm Order' : 'Pay Now'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {paymentStep === 'processing' && (
                            <div className="text-center py-10">
                                <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <h3 className="text-lg font-bold text-gray-700">Processing Payment...</h3>
                                <p className="text-sm text-gray-500">Please do not close this window</p>
                            </div>
                        )}

                        {paymentStep === 'success' && (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="text-green-600 text-3xl">✓</div>
                                </div>
                                <h3 className="text-xl font-bold text-green-700">Order Confirmed!</h3>
                                <p className="text-sm text-gray-500 mt-2">Your fresh produce is on the way.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
