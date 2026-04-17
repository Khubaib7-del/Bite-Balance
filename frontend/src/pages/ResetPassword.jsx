import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Lock, 
    CheckCircle, 
    AlertCircle, 
    KeyRound, 
    Zap,
    ShieldCheck
} from 'lucide-react';
import { authService } from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Credentials desynchronized. Check passwords.');
        }

        setLoading(true);
        setError('');
        try {
            const res = await authService.resetPassword(token, password);
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Finalization error. Please retry.');
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
                <div className="mb-5 text-center">
                    <div className="d-inline-flex align-items-center justify-content-center p-4 bb-grad-energy rounded-4 text-white mb-4 shadow-lg">
                        <KeyRound size={40} />
                    </div>
                    <h1 className="h2 fw-black text-dark mb-2">Finalize Protocol 🔑</h1>
                    <p className="text-muted fw-medium">Execute authority override to establish new credentials.</p>
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
                        <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2">New Access Key</label>
                        <div className="bb-input-wrapper-lg">
                            <Lock className="icon" size={24} />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="bb-input-field mb-0">
                        <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2">Confirm Key Synchronization</label>
                        <div className="bb-input-wrapper-lg">
                            <ShieldCheck className="icon" size={24} />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="btn bg-dark text-white w-100 py-3 rounded-pill fw-black shadow-lg hover-shadow-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <div className="spinner-border spinner-border-sm" role="status" />
                                <span>Encoding...</span>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <Zap size={18} />
                                <span>Execute Override</span>
                            </div>
                        )}
                    </motion.button>
                </form>

                <div className="mt-5 text-center pt-4 border-top">
                    <div className="text-muted extra-small fw-black opacity-60">
                        REDIRECTING UPON SUCCESSFUL DEPLOYMENT
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
