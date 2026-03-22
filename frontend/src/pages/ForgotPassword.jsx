import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Mail, 
    ChevronLeft, 
    CheckCircle, 
    AlertCircle, 
    RefreshCw,
    Sparkles,
    Shield
} from 'lucide-react';
import { authService } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await authService.forgotPassword(email);
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification sequence failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
            <motion.div 
                className="bb-auth-card p-4 p-md-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: '480px', width: '100%', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(32px)', borderRadius: '40px', border: '1px solid rgba(16, 185, 129, 0.1)' }}
            >
                <Link to="/login" className="d-inline-flex align-items-center gap-2 text-muted text-decoration-none small fw-black mb-5 hover-shadow-sm transition-all py-2 pe-4 ps-1 bg-light rounded-pill">
                    <div className="bg-white rounded-circle p-1 shadow-sm"><ChevronLeft size={16} /></div>
                    <span>Back to Portal</span>
                </Link>

                <div className="mb-5 text-center">
                    <div className="d-inline-flex align-items-center justify-content-center p-4 bb-grad-green rounded-4 text-white mb-4 shadow-lg rotate-12">
                        <RefreshCw size={40} />
                    </div>
                    <h1 className="display-6 fw-black text-dark mb-2">Access Recovery 🧬</h1>
                    <p className="text-muted fw-medium lead fs-6">Enter your credentials to initiate the secure reset protocol.</p>
                </div>

                <AnimatePresence>
                    {(message || error) && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`alert border-0 rounded-4 px-4 py-3 mb-4 d-flex align-items-center gap-3 shadow-sm ${message ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                        >
                            {message ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="small fw-black">{message || error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div className="bb-input-field mb-0">
                        <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2">Identity Protocol (Email)</label>
                        <div className="bb-input-wrapper-lg">
                            <Mail className="icon" size={24} />
                            <input 
                                type="email" 
                                placeholder="name@domain.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="btn bb-grad-green text-white w-100 py-3 rounded-pill fw-black shadow-lg hover-shadow-xl"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <div className="spinner-border spinner-border-sm" role="status" />
                                <span>Authenticating...</span>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <Shield size={18} />
                                <span>Initiate Recovery</span>
                            </div>
                        )}
                    </motion.button>
                </form>

                <div className="mt-5 text-center pt-4 border-top">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted extra-small fw-black">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>SECURED BY BYTEBALANCE ENCRYPTION</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
