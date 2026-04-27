import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    CalendarDays, 
    Search, 
    PieChart, 
    BookOpen,
    Sparkles
} from 'lucide-react';
import '../styles/Planner.css';

const PlannerHome = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Meal Planner', path: '/planner', icon: <CalendarDays size={18} /> },
        { name: 'Food Search', path: '/search', icon: <Search size={18} /> },
        { name: 'Analytics', path: '/summary', icon: <PieChart size={18} /> },
        { name: 'Saved Plans', path: '/saved-plans', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className="planner-container">
            <header className="planner-header mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="p-2 rounded-circle bg-emerald-500 text-white">
                        <Sparkles size={16} />
                    </div>
                    <span className="extra-small fw-black text-uppercase tracking-widest text-emerald-600">Personal Nutrition System</span>
                </div>
                <h1 className="h2 fw-black mb-4">Daily Planner</h1>

                <nav className="planner-nav scroll-hide">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end
                            className={({ isActive }) => 
                                `planner-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </header>

            <motion.div 
                className="planner-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* For this specific requirement, we can either use an Outlet or just link to the pages. 
                    Since the routes already exist in App.js, clicking these will navigate away from PlannerHome
                    unless we restructure App.js. 
                    
                    However, the user wants these on a NAV BAR for the page. 
                    I'll make it a prominent navigation center.
                */}
                <div className="row g-4">
                    {navItems.map((item, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-xl-4">
                            <NavLink to={item.path} className="text-decoration-none">
                                <motion.div 
                                    className="bb-chart-card h-100 hover-up transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="p-3 rounded-4 bg-emerald-50 text-emerald-600">
                                            {item.icon}
                                        </div>
                                        <h5 className="fw-black mb-0 text-dark">{item.name}</h5>
                                    </div>
                                    <p className="small text-muted mb-0">Access your {item.name.toLowerCase()} tools and manage your nutritional progress.</p>
                                </motion.div>
                            </NavLink>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default PlannerHome;
