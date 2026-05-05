import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, User, Menu, Settings, Utensils, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import { userService } from '../services/api';
import '../styles/Layout.css';

const Navbar = ({ toggleSidebar }) => {
    const userJson = localStorage.getItem('user');
    let user = null;
    try {
        user = (userJson && userJson !== 'undefined') ? JSON.parse(userJson) : null;
    } catch (e) {
        console.error("User parsing failed", e);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await userService.getNotifications();
                setNotifications(res.data || []);
            } catch (err) {
                console.error('Navbar notifications failed', err);
                setNotifications([]);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <header className="bb-header">
            {/* Left Section: Logo & Toggle */}
            <div className="d-flex align-items-center gap-3">
                <motion.button
                    className="btn btn-light rounded-2xl p-2 border-0 shadow-sm d-lg-none"
                    whileHover={{ scale: 1.05, background: 'var(--bb-grad-fresh)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSidebar}
                >
                    <Menu size={24} className="text-emerald-600" />
                </motion.button>

                <div className="d-flex align-items-center gap-3">
                    <motion.div 
                        className="bb-logo-3d"
                        animate={{ 
                            rotateY: [0, 10, -10, 0],
                            rotateX: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    >
                        <Utensils size={24} color="white" />
                        <motion.div 
                            className="bb-logo-badge"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>
                    
                    <div className="d-none d-md-block">
                        <h1 className="fs-5 fw-bold mb-0 bb-gradient-text" style={{ background: 'var(--bb-grad-fresh)', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                            ByteBalance
                        </h1>
                        <p className="small text-muted mb-0 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                            <Sparkles size={10} className="text-amber-500" style={{ color: '#f59e0b' }} /> Fresh & Healthy
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="d-flex align-items-center gap-3">
                {/* Search - Desktop */}
                <div className="d-none d-xl-flex align-items-center bg-white rounded-pill px-3 py-1 border shadow-sm">
                    <Search size={18} className="text-muted me-2" />
                    <input 
                        type="text" 
                        placeholder="Search recipes..." 
                        className="form-control border-0 bg-transparent shadow-none small"
                        style={{ width: '200px', fontSize: '0.85rem' }} 
                    />
                </div>

                {/* Notification Bell */}
                <div className="dropdown">
                    <motion.button
                        className="btn btn-white rounded-circle p-2 border shadow-sm position-relative"
                        whileHover={{ scale: 1.1, background: 'var(--bb-orange-50)' }}
                        data-bs-toggle="dropdown"
                    >
                        <Bell size={20} className="text-muted" />
                        <motion.span 
                            className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle"
                            style={{ top: '25%', left: '75%' }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.button>
                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-3 mt-3 rounded-4" style={{ width: '320px' }}>
                        <li className="mb-2 pb-2 border-bottom">
                            <h6 className="fw-bold mb-0">Notifications</h6>
                        </li>
                        {notifications.slice(0, 3).map((n, index) => (
                            <li key={`${n.title}-${index}`}>
                                <button className="dropdown-item d-flex gap-3 p-3 rounded-3 mb-1">
                                    <span className="fs-4">{n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                                    <div>
                                        <p className="mb-0 small fw-bold">{n.title}</p>
                                        <span className="text-muted extra-small">{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                        <li className="mt-2 pt-2 border-top text-center">
                            <Link to="/notifications" className="text-emerald-600 extra-small fw-black text-uppercase text-decoration-none hover-underline">View All Notifications</Link>
                        </li>
                    </ul>
                </div>

                {/* User Profile */}
                <div className="dropdown">
                    <motion.button
                        className="d-flex align-items-center gap-2 bg-white border rounded-pill p-1 pe-3 shadow-sm"
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)' }}
                        data-bs-toggle="dropdown"
                    >
                        <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{ 
                                width: '36px', 
                                height: '36px', 
                                background: 'var(--bb-grad-fresh)',
                                border: '2px solid white'
                            }}
                        >
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="d-none d-sm-block text-start">
                            <p className="small fw-bold mb-0 text-dark" style={{ lineHeight: '1.2' }}>{user?.username || 'Guest'}</p>
                            <span className="extra-small text-muted d-flex align-items-center gap-1">
                                {user?.role === 'ADMIN' ? <><ShieldCheck size={10} /> Admin</> : <><Sparkles size={10} /> Premium</>}
                            </span>
                        </div>
                    </motion.button>
                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 mt-3 rounded-4" style={{ minWidth: '220px' }}>
                        <li><Link to="/profile" className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 small fw-bold text-decoration-none"><User size={16} /> Profile</Link></li>
                        <li><Link to="/settings" className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 small fw-bold text-decoration-none"><Settings size={16} /> Settings</Link></li>
                        <li className="dropdown-divider my-2"></li>
                        <li><button onClick={handleLogout} className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 small fw-bold text-danger"><LogOut size={16} /> Logout</button></li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
