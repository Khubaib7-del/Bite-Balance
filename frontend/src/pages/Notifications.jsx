import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, ChevronRight, Sparkles, Trash2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import '../styles/Dashboard.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await userService.getNotifications();
                setNotifications(res.data || []);
            } catch (err) {
                console.error('Notifications load failed', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const preparedNotifications = useMemo(() => {
        const iconMap = {
            success: <CheckCircle className="text-emerald-500" />,
            info: <Info className="text-primary" />,
            warning: <AlertTriangle className="text-amber-500" />,
            sparkle: <Sparkles className="text-emerald-500" />
        };

        return notifications.map((notif, index) => ({
            id: `${notif.type}-${index}`,
            title: notif.title,
            desc: notif.description,
            time: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now',
            icon: iconMap[notif.type] || iconMap.info
        }));
    }, [notifications]);

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
                            {loading && (
                                <div className="text-center py-5 opacity-50">Loading notifications...</div>
                            )}
                            {!loading && preparedNotifications.length > 0 ? (
                                preparedNotifications.map((notif, idx) => (
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
                            ) : !loading && (
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
