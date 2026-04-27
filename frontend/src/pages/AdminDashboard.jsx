/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    BookOpen, 
    Trash2, 
    Plus, 
    ShieldCheck, 
    Settings, 
    X, 
    PlusCircle, 
    UserCircle,
    Activity,
    Database,
    Zap,
    Sparkles,
    LayoutDashboard,
    Info,
    ChefHat
} from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, articlesRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getArticles()
            ]);
            setUsers(usersRes.data || []);
            setArticles(articlesRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            {/* Premium Admin Header */}
            <header className="bb-admin-header mb-5">
                <div className="row align-items-center g-4 position-relative z-1">
                    <div className="col-12 col-xl-7">
                        <div className="d-flex align-items-center gap-2 mb-3 text-emerald-400">
                            <ShieldCheck size={20} />
                            <span className="extra-small fw-black text-uppercase tracking-widest">Platform Administration</span>
                        </div>
                        <h1 className="display-4 fw-black mb-2">Management Center</h1>
                        <p className="lead opacity-70 mb-0">Overseeing system performance, content integrity, and user engagement metrics.</p>
                    </div>
                    <div className="col-12 col-xl-5">
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="bb-admin-stat-small bg-white p-4 rounded-4 shadow-sm border">
                                    <span className="extra-small fw-black opacity-50 text-uppercase tracking-wider">Total Users</span>
                                    <span className="h2 fw-black d-block mb-1">{users.length}</span>
                                    <div className="d-flex align-items-center gap-2 text-emerald-600 small fw-bold">
                                        <Activity size={12} />
                                        <span>System Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bb-admin-stat-small bg-white p-4 rounded-4 shadow-sm border">
                                    <span className="extra-small fw-black opacity-50 text-uppercase tracking-wider">Knowledge Base</span>
                                    <span className="h2 fw-black d-block mb-1">{articles.length}</span>
                                    <div className="d-flex align-items-center gap-2 text-primary small fw-bold">
                                        <Database size={12} />
                                        <span>Verified Articles</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="row g-4">
                <div className="col-12 col-xl-8">
                    <div className="bb-chart-card mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="h5 fw-black text-dark mb-0">Recent Content</h3>
                            <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold">View Library</button>
                        </div>
                        <div className="row g-3">
                            {articles.slice(0, 4).map((article, i) => (
                                <div key={i} className="col-12 col-md-6">
                                    <div className="p-3 rounded-4 bg-light bg-opacity-50 border">
                                        <span className="badge rounded-pill bg-emerald-50 text-emerald-700 px-2 py-1 extra-small fw-black text-uppercase mb-2">{article.Category}</span>
                                        <h6 className="fw-black text-dark mb-1">{article.Title}</h6>
                                        <p className="extra-small text-muted mb-0 text-truncate">{article.Content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bb-chart-card">
                        <h3 className="h5 fw-black text-dark mb-4">System Alerts</h3>
                        <div className="alert bg-blue-50 text-blue-700 border-0 rounded-4 px-4 py-3 mb-0 d-flex align-items-center gap-3">
                            <Info size={20} />
                            <div className="small fw-bold">Daily system maintenance completed successfully. All services are nominal.</div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <AdminSettings />
                </div>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const [adminCode, setAdminCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await adminService.getAdminCode();
                setAdminCode(res.data.adminCode);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchCode();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateAdminCode(adminCode);
            setMessage('Registration code updated successfully.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="text-center py-5 opacity-40">Accessing Configuration...</div>;

    return (
        <div className="bb-chart-card h-100">
            <h3 className="h5 fw-black text-dark mb-4">Security Settings</h3>
            
            {message && (
                <div className="alert bg-emerald-50 text-emerald-700 border-0 rounded-4 px-3 py-2 mb-4 small fw-bold">
                    {message}
                </div>
            )}

            <form onSubmit={handleUpdate}>
                <div className="mb-4">
                    <label className="extra-small fw-black text-muted text-uppercase mb-2">Admin Registration Code</label>
                    <p className="extra-small text-muted mb-3">This code is required for new administrative registrations.</p>
                    <input
                        className="form-control bg-light border-0 py-3 rounded-4 fw-black font-monospace"
                        value={adminCode}
                        onChange={e => setAdminCode(e.target.value)}
                        placeholder="ADMIN123"
                    />
                </div>
                <button className="btn btn-dark rounded-pill w-100 py-3 fw-black small shadow-sm">Update Code</button>
            </form>

            <div className="mt-5 pt-4 border-top">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle bg-light p-2"><ShieldCheck size={18} className="text-primary" /></div>
                    <div>
                        <p className="small fw-bold mb-0">Role Management</p>
                        <p className="extra-small text-muted mb-0">System enforces RBAC policies.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
