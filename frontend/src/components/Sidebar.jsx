import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Search, 
    CalendarDays, 
    PieChart, 
    BookOpen, 
    ShieldCheck, 
    LogOut,
    Sparkles,
    ChevronRight,
    Settings,
    User,
    Bell
} from 'lucide-react';
import '../styles/Layout.css';

const Sidebar = ({ onLogout, collapsed, showMobile, toggleMobile }) => {
    const userJson = localStorage.getItem('user');
    let user = null;
    try {
        user = (userJson && userJson !== 'undefined') ? JSON.parse(userJson) : null;
    } catch (e) {
        console.error("User parsing failed", e);
    }
    const isAdmin = user?.role === 'ADMIN';

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Meal Planner', path: '/planner', icon: <CalendarDays size={20} /> },
        { name: 'Food Search', path: '/search', icon: <Search size={20} /> },
        { name: 'Analytics', path: '/summary', icon: <PieChart size={20} /> },
        { name: 'Saved Plans', path: '/saved-plans', icon: <BookOpen size={20} /> },
        { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    ];

    if (isAdmin) {
        navItems.push({ name: 'Admin Portal', path: '/admin', icon: <ShieldCheck size={20} /> });
    }

    const containerVariants = {
        show: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <aside className={`bb-sidebar ${collapsed ? 'collapsed' : ''} ${showMobile ? 'show-mobile' : ''}`}>
            {/* Mobile Close Button (Optional if needed) */}
            
            <motion.div 
                className="flex-grow-1 overflow-auto py-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {navItems.map((item) => (
                    <motion.div key={item.name} variants={itemVariants} className="px-3 mb-2">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => 
                                `d-flex align-items-center justify-content-between p-3 rounded-20 text-decoration-none transition-all ${
                                    isActive ? 'bb-grad-green text-white shadow-lg fw-bold' : 'text-muted hover-light'
                                }`
                            }
                            onClick={showMobile ? toggleMobile : undefined}
                            style={({ isActive }) => isActive ? {} : { color: '#64748b' }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                {item.icon}
                                <span className="small">{item.name}</span>
                            </div>
                            <ChevronRight size={14} className="opacity-50" />
                        </NavLink>
                    </motion.div>
                ))}
            </motion.div>

            {/* Sidebar Footer Widget */}
            {!collapsed && (
                <motion.div 
                    className="bb-goal-widget"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '40px', height: '40px', background: 'var(--bb-grad-energy)' }}
                        >
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <p className="small fw-bold mb-0">Today's Goal</p>
                            <p className="extra-small text-muted mb-0">Stay on track!</p>
                        </div>
                    </div>
                    
                    <p className="extra-small mb-1 fw-bold text-dark mt-3">🔥 1,234 / 2,000 cal</p>
                    <div className="bb-progress-container">
                        <motion.div 
                            className="bb-progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: '62%' }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <motion.p 
                        className="extra-small text-center mt-2 fw-bold text-emerald-600 mb-0"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Keep going! 💪
                    </motion.p>
                </motion.div>
            )}

            {/* Logout at bottom */}
            <div className="p-3 border-top border-white border-opacity-10">
                <button 
                    onClick={onLogout}
                    className="btn border-0 w-100 d-flex align-items-center gap-3 p-3 rounded-20 text-danger hover-bg-red transition-all fw-bold small"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
