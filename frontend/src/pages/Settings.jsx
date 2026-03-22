import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Settings, 
    Moon, 
    Sun, 
    Bell, 
    Globe, 
    Shield, 
    Trash2, 
    CheckCircle,
    Smartphone,
    Mail,
    ChevronRight,
    CircleSlash
} from 'lucide-react';
import '../styles/Dashboard.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('General');
    const [notifs, setNotifs] = useState({
        email: true,
        push: false,
        weeklyReport: true
    });
    const [units, setUnits] = useState('Metric');
    const [theme, setTheme] = useState('Light');

    const toggleNotif = (key) => {
        setNotifs({ ...notifs, [key]: !notifs[key] });
    };

    const tabs = [
        { name: 'General', icon: <Globe size={18} /> },
        { name: 'Notifications', icon: <Bell size={18} /> },
        { name: 'Security', icon: <Shield size={18} /> },
        { name: 'Appearance', icon: <Sun size={18} /> }
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
                <div className="d-flex align-items-center gap-3">
                    <div className="p-3 rounded-circle bg-white bg-opacity-20 backdrop-blur">
                        <Settings size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="h2 fw-black mb-0 text-white">App Settings</h1>
                        <p className="small mb-0 text-white text-opacity-75">Personalize your ByteBalance experience</p>
                    </div>
                </div>
            </motion.div>

            <div className="row g-4">
                {/* Tab Sidebar */}
                <div className="col-12 col-md-4 col-xl-3">
                    <motion.div 
                        className="bb-chart-card p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="d-flex flex-column gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`btn d-flex align-items-center justify-content-between p-3 rounded-3 fw-bold transition-all border-0 shadow-none text-start ${activeTab === tab.name ? 'bg-emerald-50 text-emerald-600' : 'text-muted hover-light'}`}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {tab.icon}
                                        <span>{tab.name}</span>
                                    </div>
                                    {activeTab === tab.name && <div className="indicator rounded-pill bg-emerald-500" style={{ width: 4, height: 18 }} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Area */}
                <div className="col-12 col-md-8 col-xl-9">
                    <motion.div 
                        className="bb-chart-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        key={activeTab} // Animate on tab switch
                    >
                        {activeTab === 'General' && (
                            <div>
                                <h4 className="fw-black mb-4">General Preferences</h4>
                                
                                <div className="mb-5">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-3 d-block">Measurement Units</label>
                                    <div className="d-flex gap-3">
                                        {['Metric', 'Imperial'].map(u => (
                                            <button 
                                                key={u}
                                                onClick={() => setUnits(u)}
                                                className={`btn flex-grow-1 p-4 rounded-4 fw-black transition-all border-0 shadow-none ${units === u ? 'bb-grad-green text-white shadow-lg' : 'bg-light text-muted'}`}
                                            >
                                                {u === 'Metric' ? 'kg / cm' : 'lb / in'}
                                                <div className="small opacity-50 fw-bold">{u} System</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-4 bg-light">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <p className="fw-bold mb-0 text-dark">Default Portion Size</p>
                                            <p className="extra-small text-muted mb-0">Set your usual serving unit.</p>
                                        </div>
                                        <select 
                                            className="form-select border-0 bg-white w-auto fw-bold pe-5 py-2 rounded-3 shadow-sm"
                                            style={{ minWidth: '150px' }}
                                        >
                                            {units === 'Metric' ? (
                                                <>
                                                    <option>Grams (g)</option>
                                                    <option>Kilograms (kg)</option>
                                                    <option>Milliliters (ml)</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option>Ounces (oz)</option>
                                                    <option>Pounds (lb)</option>
                                                    <option>Fluid Ounces (fl oz)</option>
                                                </>
                                            )}
                                            <option>Servings</option>
                                            <option>Cups</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Notifications' && (
                            <div>
                                <h4 className="fw-black mb-4">Notification Settings</h4>
                                
                                <div className="space-y-3">
                                    {[
                                        { label: 'Weekly Summary', desc: 'Get a report of your nutrition journey every Sunday.', icon: <CheckCircle className="text-emerald-500" />, key: 'weeklyReport' },
                                        { label: 'Push Notifications', desc: 'Real-time alerts for meal reminders.', icon: <Smartphone className="text-primary" />, key: 'push' },
                                        { label: 'Email Marketing', desc: 'Receive updates about new features and tips.', icon: <Mail className="text-orange-500" />, key: 'email' }
                                    ].map((item, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between p-4 rounded-4 border border-faint mb-3 hover-light transition-all cursor-pointer" onClick={() => toggleNotif(item.key)}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 rounded-3 bg-light">{item.icon}</div>
                                                <div>
                                                    <p className="fw-bold mb-0 text-dark">{item.label}</p>
                                                    <p className="extra-small text-muted mb-0">{item.desc}</p>
                                                </div>
                                            </div>
                                            <div className={`form-check form-switch custom-switch ${notifs[item.key] ? 'active' : ''}`}>
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    checked={notifs[item.key]} 
                                                    onChange={() => {}} // Controlled by div click
                                                    style={{ transform: 'scale(1.4)', cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Appearance' && (
                            <div>
                                <h4 className="fw-black mb-4">Interface Customization</h4>
                                <div className="row g-3">
                                    {[
                                        { id: 'Light', name: 'Original Light', icon: <Sun size={24} />, desc: 'Fresh and vibrant', grad: 'linear-gradient(135deg, #fff 0%, #f0fdf4 100%)' },
                                        { id: 'Dark', name: 'Midnight Dark', icon: <Moon size={24} />, desc: 'Easy on the eyes (Alpha)', grad: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }
                                    ].map(t => (
                                        <div key={t.id} className="col-12 col-md-6">
                                            <div 
                                                onClick={() => {
                                                    setTheme(t.id);
                                                    if (t.id === 'Dark') {
                                                        document.body.classList.add('dark-mode-preview');
                                                        alert("Dark Mode is in Alpha. Applying temporary preview theme!");
                                                    } else {
                                                        document.body.classList.remove('dark-mode-preview');
                                                    }
                                                }}
                                                className={`p-4 rounded-4 border-2 transition-all cursor-pointer h-100 ${theme === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-light'}`}
                                            >
                                                <div className="rounded-3 mb-3" style={{ height: 60, background: t.grad }}></div>
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    {t.icon}
                                                    <p className="fw-black mb-0">{t.name}</p>
                                                </div>
                                                <p className="extra-small text-muted mb-0">{t.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Security' && (
                            <div>
                                <h4 className="fw-black mb-4">Privacy & Access</h4>
                                
                                <button className="btn btn-light w-100 d-flex align-items-center justify-content-between p-4 rounded-4 mb-3 text-start border-0 shadow-none">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 rounded-3 bg-white text-dark"><Shield size={20}/></div>
                                        <div>
                                            <p className="fw-bold mb-0">Change Password</p>
                                            <p className="extra-small text-muted mb-0">Last changed 2 months ago.</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-muted" />
                                </button>

                                <div className="mt-5 pt-5 border-top">
                                    <p className="extra-small fw-black text-uppercase text-danger mb-3">Danger Zone</p>
                                    <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-between p-4 rounded-4 text-start border-2 fw-bold">
                                        <div className="d-flex align-items-center gap-3">
                                            <Trash2 size={20} />
                                            <div>
                                                <p className="mb-0">Delete Account</p>
                                                <p className="extra-small opacity-75 mb-0">This action is irreversible.</p>
                                            </div>
                                        </div>
                                        <CircleSlash size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
