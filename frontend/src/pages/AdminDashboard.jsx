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
    const [activeView, setActiveView] = useState('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const usersRes = await adminService.getUsers();
            const articlesRes = await adminService.getArticles();
            setUsers(usersRes.data || []);
            setArticles(articlesRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            {/* Premium Admin Header */}
            <header className="bb-admin-header">
                <div className="row align-items-center g-4 position-relative z-1">
                    <div className="col-12 col-xl-6">
                        <div className="d-flex align-items-center gap-2 mb-3 text-emerald-400">
                            <ShieldCheck size={20} />
                            <span className="extra-small fw-black text-uppercase tracking-widest">Master Control 2.0</span>
                        </div>
                        <h1 className="display-4 fw-black mb-2">Management Center</h1>
                        <p className="lead opacity-70 mb-4">Overseeing organizational growth and platform integrity.</p>
                        
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {[
                                { id: 'users', label: 'User Analytics', icon: <Users size={18} /> },
                                { id: 'articles', label: 'Content Lab', icon: <BookOpen size={18} /> },
                                { id: 'settings', label: 'Engine Config', icon: <Settings size={18} /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveView(tab.id)}
                                    className={`bb-btn-tab ${activeView === tab.id ? 'active' : ''}`}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-12 col-xl-6">
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="bb-admin-stat-small">
                                    <span className="extra-small fw-black opacity-50 text-uppercase tracking-wider">Active Entities</span>
                                    <span className="h2 fw-black mb-0">{users.length}</span>
                                    <div className="d-flex align-items-center gap-2 text-emerald-400 small">
                                        <Activity size={12} />
                                        <span>+12.5% vs LW</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bb-admin-stat-small">
                                    <span className="extra-small fw-black opacity-50 text-uppercase tracking-wider">Content Items</span>
                                    <span className="h2 fw-black mb-0">{articles.length}</span>
                                    <div className="d-flex align-items-center gap-2 text-blue-400 small">
                                        <Database size={12} />
                                        <span>Synced Globally</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <LayoutDashboard size={250} className="position-absolute opacity-10" style={{ right: '-50px', top: '-50px' }} />
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                >
                    {activeView === 'users' ? (
                        <UserTable users={users} refresh={fetchData} />
                    ) : activeView === 'articles' ? (
                        <ArticleTable articles={articles} refresh={fetchData} />
                    ) : (
                        <AdminSettings />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const UserTable = ({ users, refresh }) => {
    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this user account?')) return;
        try {
            await adminService.deleteUser(id);
            refresh();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="bb-admin-card">
            <div className="table-responsive">
                <table className="bb-admin-table">
                    <thead>
                        <tr>
                            <th>User Protocol</th>
                            <th>Identity String</th>
                            <th>Access Level</th>
                            <th>Created On</th>
                            <th className="text-end">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => (
                            <motion.tr 
                                key={user.UserID}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-emerald-50 text-emerald-600 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                                            <UserCircle size={24} />
                                        </div>
                                        <span className="fw-black">{user.Username}</span>
                                    </div>
                                </td>
                                <td><span className="text-muted font-monospace small">{user.Email}</span></td>
                                <td>
                                    <span className={`badge rounded-pill px-3 py-2 fw-black ${user.Role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {user.Role === 'ADMIN' ? <Zap size={12} className="me-1" /> : null}
                                        {user.Role}
                                    </span>
                                </td>
                                <td><span className="text-muted small">{new Date(user.CreatedAt).toLocaleDateString()}</span></td>
                                <td className="text-end">
                                    <button onClick={() => handleDelete(user.UserID)} className="btn btn-link text-muted hover-text-danger p-0">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ArticleTable = ({ articles, refresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'Weight Loss Myths' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.createArticle(formData);
            setShowModal(false);
            refresh();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteArticle(id);
            refresh();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-0">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h3 className="h4 fw-black text-dark mb-0 d-flex align-items-center gap-2">
                    Knowledge Base <Sparkles className="text-amber-500" size={20} />
                </h3>
                <motion.button 
                    onClick={() => setShowModal(true)} 
                    className="btn bb-grad-green text-white rounded-pill px-4 py-2 fw-black shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <PlusCircle size={20} className="me-2" /> Flash Briefing
                </motion.button>
            </div>

            <div className="row g-4">
                {articles.map((article, i) => (
                    <div key={article.ArticleID} className="col-12 col-md-6">
                        <motion.div 
                            className="bb-admin-card p-4 h-100 d-flex flex-column group hover-shadow-xl transition-all"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="mb-3 d-flex justify-content-between align-items-start">
                                <span className="badge rounded-pill bg-emerald-50 text-emerald-700 px-3 py-2 extra-small fw-black text-uppercase">{article.Category}</span>
                                <button onClick={() => handleDelete(article.ArticleID)} className="btn btn-link text-muted hover-text-danger p-0 opacity-20 group-hover:opacity-100">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h4 className="h5 fw-black text-dark mb-2">{article.Title}</h4>
                            <p className="small text-muted mb-0 flex-grow-1" style={{ lineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.Content}</p>
                        </motion.div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="bb-modal-overlay">
                        <motion.div 
                            className="bb-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ maxWidth: '800px' }}
                        >
                            <div className="bb-modal-header">
                                <h2 className="h4 fw-black text-dark mb-0">Intel Creation Module</h2>
                                <button className="btn btn-light rounded-circle p-2" onClick={() => setShowModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="bb-modal-body">
                                <div className="mb-4">
                                    <label className="extra-small fw-black text-muted text-uppercase mb-2">Subject Title</label>
                                    <input
                                        className="form-control bg-light border-0 py-3 rounded-4 fw-bold"
                                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Headline..."
                                    />
                                </div>
                                <div className="row g-4 mb-4">
                                    <div className="col-12 col-md-4">
                                        <label className="extra-small fw-black text-muted text-uppercase mb-2">Sector</label>
                                        <select
                                            className="form-select bg-light border-0 py-3 rounded-4 fw-black"
                                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Weight Loss Myths</option>
                                            <option>Carbohydrates</option>
                                            <option>Protein</option>
                                            <option>Diet Trends</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-8">
                                        <label className="extra-small fw-black text-muted text-uppercase mb-2">Payload Content</label>
                                        <textarea
                                            className="form-control bg-light border-0 py-3 rounded-4"
                                            value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Descriptive intel..."
                                            style={{ minHeight: '150px' }}
                                        />
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <button type="submit" className="btn bb-grad-green text-white rounded-pill flex-grow-1 py-3 fw-black shadow-lg">Broadcast Content</button>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-light rounded-pill px-5 py-3 fw-black text-muted">Abort</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
            setMessage('Master Authorization Key Updated. 🔑');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="text-center py-5 opacity-40">Decrypting Configuration...</div>;

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                <div className="bb-admin-card p-5">
                    <h3 className="h3 fw-black text-dark mb-4">Core Protocols</h3>
                    
                    {message && (
                        <div className="alert bg-black text-white border-0 rounded-4 px-4 py-3 mb-4 fw-black d-flex align-items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="d-flex flex-column gap-5">
                        <div className="p-4 bg-light rounded-5 border-white border">
                            <label className="extra-small fw-black text-muted text-uppercase mb-3 tracking-widest">Master Admin Authorization Key</label>
                            <p className="small text-muted mb-4 fw-medium">Anyone with this code will gain total administrative access to the ByteBalance infrastructure.</p>
                            <div className="input-group rounded-4 border-0 shadow-sm overflow-hidden bg-white">
                                <span className="input-group-text bg-transparent border-0 px-4 fs-4">🔐</span>
                                <input
                                    className="form-control border-0 py-4 font-monospace fs-4 fw-black"
                                    value={adminCode}
                                    onChange={e => setAdminCode(e.target.value)}
                                    placeholder="MASTER_KEY_2024"
                                />
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between gap-4">
                            <div className="d-flex align-items-center gap-2 text-muted fw-bold small">
                                <Info size={16} />
                                <span>Action will be logged in global audit trail</span>
                            </div>
                            <button className="btn btn-dark rounded-pill px-5 py-3 fw-black shadow-lg">Commit Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
