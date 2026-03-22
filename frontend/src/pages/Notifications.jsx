import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, ChevronRight, Sparkles, Trash2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Notifications = () => {
    const notifications = [
        { 
            id: 1, 
            type: 'success', 
            title: 'Goal Achieved! 🎉', 
            desc: "You've reached 75% of your daily calorie goal. Keep it up!", 
            time: '2 hours ago',
            icon: <CheckCircle className="text-emerald-500" />
        },
        { 
            id: 2, 
            type: 'info', 
            title: 'New Meal Plan Ready', 
            desc: "Your nutritional plan for tomorrow has been generated based on your profile.", 
            time: '5 hours ago',
            icon: <Info className="text-primary" />
        },
        { 
            id: 3, 
            type: 'warning', 
            title: 'Low Hydration Alert', 
            desc: "You haven't logged any water intake in the last 4 hours. Stay hydrated!", 
            time: '1 day ago',
            icon: <AlertTriangle className="text-amber-500" />
        },
        { 
            id: 4, 
            type: 'success', 
            title: 'Profile Updated', 
            desc: "Your health metrics were successfully synchronized with the backend.", 
            time: '2 days ago',
            icon: <Sparkles className="text-emerald-500" />
        }
    ];

    return (
        <div className="container-fluid p-0">
            {/* Header section */}
            <motion.div 
                className="bb-welcome-banner mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'var(--bb-grad-fresh)' }}
            >
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-circle bg-white bg-opacity-20 backdrop-blur">
                            <Bell size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="h2 fw-black mb-0 text-white">Notifications</h1>
                            <p className="small mb-0 text-white text-opacity-75">Stay updated with your progress</p>
                        </div>
                    </div>
                    <Link to="/settings" className="btn btn-light rounded-pill px-3 py-2 fw-bold small d-flex align-items-center gap-2">
                        <Settings size={16} /> Configure
                    </Link>
                </div>
            </motion.div>

            <div className="row justify-content-center">
                <div className="col-12 col-xl-10">
                    <motion.div 
                        className="bb-chart-card p-0 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light bg-opacity-50">
                            <h5 className="fw-black mb-0">Recent Activity</h5>
                            <button className="btn btn-link text-muted small text-decoration-none fw-bold p-0 d-flex align-items-center gap-2">
                                <Trash2 size={14} /> Clear All
                            </button>
                        </div>

                        <div className="p-0">
                            {notifications.length > 0 ? (
                                notifications.map((notif, idx) => (
                                    <motion.div 
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-4 border-bottom hover-light transition-all cursor-pointer d-flex align-items-center justify-content-between"
                                    >
                                        <div className="d-flex align-items-center gap-4">
                                            <div className={`p-3 rounded-4 bg-white shadow-sm border border-light`}>
                                                {notif.icon}
                                            </div>
                                            <div>
                                                <h6 className="fw-black text-dark mb-1">{notif.title}</h6>
                                                <p className="small text-muted mb-1">{notif.desc}</p>
                                                <span className="extra-small text-uppercase fw-black opacity-30">{notif.time}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-muted opacity-30" />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-5 opacity-50">
                                    <Bell size={48} className="mb-3" />
                                    <p className="fw-bold">No new notifications.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 text-center">
                            <button className="btn btn-light rounded-pill px-4 py-2 fw-bold small text-muted">
                                Load older notifications
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
