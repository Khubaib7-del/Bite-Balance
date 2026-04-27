import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import { User, Mail, Lock, ShieldCheck, ChevronRight, KeyRound, Utensils, Sparkles } from 'lucide-react';
import '../styles/Auth.css';

const AuthPage = ({ setToken }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const isInitialRegister = location.pathname === '/register';
    const [isRegister, setIsRegister] = useState(isInitialRegister);
    const [loginMode, setLoginMode] = useState('USER');
    
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '', adminCode: '' });
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsRegister(location.pathname === '/register');
    }, [location.pathname]);

    const toggleMode = () => {
        const nextMode = !isRegister;
        setIsRegister(nextMode);
        setError('');
        setSuccessMsg('');
        navigate(nextMode ? '/register' : '/login', { replace: true });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (showTwoFactor) {
                // Verify the 2FA code
                const response = await authService.verifyCode(loginData.email, twoFactorToken);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setToken(response.data.token);
                window.location.href = response.data.user.role === 'ADMIN' ? '/admin' : '/';
                return;
            }

            const loginEndpoint = loginMode === 'ADMIN' ? authService.adminLogin : authService.login;
            const response = await loginEndpoint({
                email: loginData.email,
                password: loginData.password
            });

            if (response.data.requiresVerification) {
                setShowTwoFactor(true);
                setSuccessMsg('Administrative access verified. Please enter your secure passkey.');
            } else {
                localStorage.clear(); // Ensure no stale data remains
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setToken(response.data.token);
                window.location.href = response.data.user.role === 'ADMIN' ? '/admin' : '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsLoading(true);
        setError('');
        try {
            await authService.register({
                username: registerData.username,
                email: registerData.email,
                password: registerData.password,
                adminCode: loginMode === 'ADMIN' ? registerData.adminCode : ''
            });

            const loginFn = loginMode === 'ADMIN' ? authService.adminLogin : authService.login;

            const loginResponse = await loginFn({
                email: registerData.email,
                password: registerData.password
            });

            if (loginResponse.data.requiresVerification) {
                setLoginData({ email: registerData.email, password: registerData.password });
                setShowTwoFactor(true);
                setIsRegister(false);
                setSuccessMsg('Registration successful! Please verify your identity.');
                navigate('/login', { replace: true });
            } else {
                localStorage.setItem('token', loginResponse.data.token);
                localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
                setToken(loginResponse.data.token);
                window.location.href = loginResponse.data.user.role === 'ADMIN' ? '/admin' : '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const formVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
            }
        },
        exit: (direction) => ({
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.95,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
            }
        })
    };

    return (
        <div className="auth-page-wrapper">
            <motion.div 
                className="auth-card-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Visual Overlay - Desktop Only */}
                <div className={`auth-overlay-panel d-none d-lg-block order-${isRegister ? '1' : '2'}`}>
                    <motion.div 
                        className="auth-overlay-bg"
                        initial={false}
                        animate={{ 
                            scale: isRegister ? 1.1 : 1,
                            rotate: isRegister ? 1 : 0
                        }}
                        style={{ 
                            backgroundImage: `url('https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1200')` 
                        }}
                    />
                    <div className="auth-overlay-content">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10, stiffness: 100 }}
                            className="bg-white p-3 rounded-4 mb-4 shadow-lg"
                        >
                            <Utensils size={48} className="text-emerald-500" style={{ color: '#10b981' }} />
                        </motion.div>
                        <h2 className="display-5 fw-bold mb-3">
                            {isRegister ? 'Welcome to ByteBalance' : 'Health is Wealth'}
                        </h2>
                        <p className="lead opacity-90 mb-0">
                            {isRegister 
                                ? 'Unlock your potential with personalized nutrition tracking.' 
                                : 'Sign in to continue your journey towards a healthier you.'}
                        </p>
                        
                        <motion.button 
                            className="btn btn-outline-light rounded-pill px-5 py-2 mt-5 fw-bold border-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMode}
                        >
                            {isRegister ? 'Already have an account? Sign In' : 'New here? Create Account'}
                        </motion.button>
                    </div>
                </div>

                {/* Form Panel */}
                <div className={`auth-form-panel order-${isRegister ? '2' : '1'}`}>
                    <AnimatePresence mode="wait" custom={isRegister ? 1 : -1}>
                        <motion.div
                            key={isRegister ? 'register' : 'login'}
                            custom={isRegister ? 1 : -1}
                            variants={formVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-100"
                        >
                            <div className="text-center mb-5">
                                {loginMode === 'ADMIN' && (
                                    <div className="auth-badge-admin">
                                        <Sparkles size={14} /> Admin Access
                                    </div>
                                )}
                                <h1 className="display-6 fw-bold text-dark">
                                    {isRegister ? 'Account Registration' : (showTwoFactor ? 'Security Verification' : 'Portal Access')}
                                </h1>
                                <p className="text-muted">
                                    {isRegister 
                                        ? 'Join ByteBalance for professional nutrition management.' 
                                        : 'Please enter your credentials to authenticate.'}
                                </p>
                            </div>

                            {error && <div className="alert alert-danger rounded-4 fw-bold border-0 shadow-sm">{error}</div>}
                            {successMsg && <div className="alert alert-success rounded-4 fw-bold border-0 shadow-sm">{successMsg}</div>}

                            <form onSubmit={isRegister ? handleRegister : handleLogin}>
                                {isRegister && (
                                    <div className="auth-input-group">
                                        <label>Username</label>
                                        <div className="auth-input-wrapper">
                                            <User className="input-icon" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="Enter username" 
                                                required 
                                                value={registerData.username} 
                                                onChange={(e) => setRegisterData({...registerData, username: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="auth-input-group">
                                    <label>Email Address</label>
                                    <div className="auth-input-wrapper">
                                        <Mail className="input-icon" size={20} />
                                        <input 
                                            type="email" 
                                            placeholder="yourname@example.com" 
                                            required 
                                            value={isRegister ? registerData.email : loginData.email} 
                                            onChange={(e) => isRegister ? setRegisterData({...registerData, email: e.target.value}) : setLoginData({...loginData, email: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <label>{showTwoFactor ? 'Security Access Key' : 'Password'}</label>
                                    <div className="auth-input-wrapper">
                                        {showTwoFactor ? (
                                            <KeyRound className="input-icon" size={20} style={{ color: '#10b981' }} />
                                        ) : (
                                            <Lock className="input-icon" size={20} />
                                        )}
                                        <input 
                                            type={showTwoFactor ? "text" : "password"}
                                            placeholder={showTwoFactor ? "Enter secure key" : "••••••••"} 
                                            required 
                                            value={showTwoFactor ? twoFactorToken : (isRegister ? registerData.password : loginData.password)} 
                                            onChange={(e) => {
                                                if (showTwoFactor) setTwoFactorToken(e.target.value);
                                                else if (isRegister) setRegisterData({...registerData, password: e.target.value});
                                                else setLoginData({...loginData, password: e.target.value});
                                            }} 
                                        />
                                    </div>
                                </div>

                                {isRegister && (
                                    <div className="auth-input-group">
                                        <label>Confirm Password</label>
                                        <div className="auth-input-wrapper">
                                            <ShieldCheck className="input-icon" size={20} />
                                            <input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                required 
                                                value={registerData.confirmPassword} 
                                                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {loginMode === 'ADMIN' && isRegister && (
                                    <div className="auth-input-group">
                                        <label style={{ color: '#f97316' }}>Admin Passcode</label>
                                        <div className="auth-input-wrapper">
                                            <KeyRound className="input-icon" size={20} style={{ color: '#f97316' }} />
                                            <input 
                                                type="password" 
                                                placeholder="Restricted Access Key" 
                                                required 
                                                value={registerData.adminCode} 
                                                onChange={(e) => setRegisterData({...registerData, adminCode: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="auth-btn mb-4" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="spinner-border spinner-border-sm" role="status"></div>
                                    ) : (
                                        <>
                                            <span>{isRegister ? 'Get Started' : 'Sign In'}</span>
                                            <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-muted small">
                                        {isRegister ? 'Already registered?' : 'Need an account?'}
                                        <button type="button" className="auth-mode-switch" onClick={toggleMode}>
                                            {isRegister ? 'Sign In' : 'Sign Up'}
                                        </button>
                                    </p>
                                    
                                    {!isRegister && (
                                        <button 
                                            type="button" 
                                            className="btn btn-link link-secondary text-decoration-none small fw-bold"
                                            onClick={() => setLoginMode(loginMode === 'USER' ? 'ADMIN' : 'USER')}
                                        >
                                            {loginMode === 'USER' ? 'Switch to Admin Portal' : 'Back to User Portal'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
