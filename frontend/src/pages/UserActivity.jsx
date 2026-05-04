import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, User, Filter } from 'lucide-react';
import '../styles/Admin.css';

const UserActivity = () => {
    const activities = [
        { id: 1, user: 'Admin', action: 'System Backup', time: '2 mins ago', icon: <Activity size={18} /> },
        { id: 2, user: 'JohnDoe', action: 'Updated Profile', time: '15 mins ago', icon: <User size={18} /> },
        { id: 3, user: 'JaneSmith', action: 'Created Meal Plan', time: '1 hour ago', icon: <Clock size={18} /> },
        { id: 4, user: 'MikeRoss', action: 'Logged Nutrition', time: '3 hours ago', icon: <Activity size={18} /> },
    ];

    return (
        <div className="admin-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-black mb-1">User Activity Log</h1>
                    <p className="text-muted small">Real-time audit log of user interactions and system events.</p>
                </div>
                <div className="dropdown">
                    <button className="btn btn-light rounded-pill px-4 border d-flex align-items-center gap-2">
                        <Filter size={18} /> Filter Log
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-12 col-xl-8">
                    <div className="bb-chart-card">
                        <div className="timeline-container">
                            {activities.map((item, idx) => (
                                <motion.div 
                                    key={item.id}
                                    className="activity-item d-flex gap-4 mb-4 position-relative"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className="activity-icon-container position-relative z-1">
                                        <div className="rounded-circle bg-white shadow-sm border d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                                            {item.icon}
                                        </div>
                                        {idx !== activities.length - 1 && <div className="activity-line"></div>}
                                    </div>
                                    <div className="activity-content flex-grow-1 p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <h6 className="fw-black mb-0">{item.user}</h6>
                                            <span className="extra-small text-muted fw-bold">{item.time}</span>
                                        </div>
                                        <p className="small text-muted mb-0">{item.action}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="bb-chart-card mb-4" style={{ background: 'var(--bb-grad-fresh)', color: 'white' }}>
                        <h5 className="fw-black mb-3">Live Status</h5>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="pulse-dot"></div>
                            <span className="fw-bold">Active Sessions: 12</span>
                        </div>
                        <p className="small opacity-90">System is processing activities normally. No anomalies detected in the last 24 hours.</p>
                    </div>

                    <div className="bb-chart-card">
                        <h5 className="fw-black mb-3">Activity Breakdown</h5>
                        {[
                            { label: 'Nutrition Logs', value: 75, color: 'var(--bb-emerald-500)' },
                            { label: 'Profile Edits', value: 15, color: 'var(--bb-amber-500)' },
                            { label: 'Security Events', value: 10, color: 'var(--bb-orange-500)' }
                        ].map((stat, i) => (
                            <div key={i} className="mb-3">
                                <div className="d-flex justify-content-between small fw-bold mb-1">
                                    <span>{stat.label}</span>
                                    <span>{stat.value}%</span>
                                </div>
                                <div className="progress rounded-pill" style={{ height: 8 }}>
                                    <div 
                                        className="progress-bar rounded-pill" 
                                        style={{ width: `${stat.value}%`, background: stat.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserActivity;
