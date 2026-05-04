import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    LogOut,
    Sparkles,
    ChevronRight,
    Settings,
    User,
    Activity,
    Users,
    Server
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

    const adminNavItems = [
        { name: 'Admin Dashboard', path: '/admin', icon: <ShieldCheck size={20} /> },
        { name: 'User Activity', path: '/admin/activity', icon: <Activity size={20} /> },
        { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'System Status', path: '/admin/status', icon: <Server size={20} /> },
    ];

    const profileItems = [
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    const containerVariants = {
        show: {
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    const renderNavLink = (item) => (
        <motion.div key={item.name} variants={itemVariants} className="px-3 mb-1">
            <NavLink
                to={item.path}
                end
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
    );

    const [summary, setSummary] = React.useState(null);
    const today = new Date().toISOString().split('T')[0];

    React.useEffect(() => {
        const fetchGoalData = async () => {
            try {
                const res = await (await import('../services/api')).mealService.getNutritionSummary(today);
                setSummary(res.data);
            } catch (err) {
                console.error("Goal widget fetch failed", err);
            }
        };
        fetchGoalData();
        
        // Refresh every 5 minutes
        const interval = setInterval(fetchGoalData, 300000);
        return () => clearInterval(interval);
    }, [today]);

    const calories = summary?.TotalCalories || 0;
    const goal = 2000;
    const percent = Math.min((calories / goal) * 100, 100);

    return (
        <aside className={`bb-sidebar ${collapsed ? 'collapsed' : ''} ${showMobile ? 'show-mobile' : ''}`}>
            <motion.div 
                className="flex-grow-1 overflow-auto py-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Primary Hub Section */}
                <div className="admin-sidebar-label">Platform</div>
                <div className="px-3 mb-4">
                        <NavLink 
                        to="/planner-home" 
                        end
                        className={({ isActive }) => `p-3 rounded-20 bg-light bg-opacity-50 border small text-decoration-none d-block transition-all ${isActive ? 'bb-grad-green text-white shadow-sm' : 'text-muted hover-light'}`}
                        >
                        <div className="d-flex align-items-center gap-3">
                            <Sparkles size={18} className={collapsed ? 'mx-auto' : ''} />
                            {!collapsed && (
                                <div>
                                    <p className="fw-black mb-0 text-inherit" style={{ fontSize: '0.85rem' }}>Personal Planner</p>
                                    <p className="extra-small mb-0 opacity-70">Nutrition & Goals</p>
                                </div>
                            )}
                        </div>
                        </NavLink>
                </div>

                {/* Admin Only Section */}
                {isAdmin && (
                    <div className="admin-sidebar-section">
                        <div className="admin-sidebar-label">Administration</div>
                        {adminNavItems.map(renderNavLink)}
                    </div>
                )}

                <div className="admin-sidebar-section">
                    <div className="admin-sidebar-label">Account</div>
                    {profileItems.map(renderNavLink)}
                </div>
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
                            <p className="small fw-bold mb-0">Daily Goal</p>
                            <p className="extra-small text-muted mb-0">Nutrition Progress</p>
                        </div>
                    </div>
                    
                    <p className="extra-small mb-1 fw-bold text-dark mt-3">Current: {calories.toLocaleString()} / {goal.toLocaleString()} kcal</p>
                    <div className="bb-progress-container">
                        <motion.div 
                            className="bb-progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <motion.p 
                        className="extra-small text-center mt-2 fw-bold text-emerald-600 mb-0"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {percent >= 100 ? "Goal Smashed! 🏆" : percent >= 75 ? "Almost there! 🔥" : "Keep going! 💪"}
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
