import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Scale, 
    Ruler, 
    Calendar, 
    Trophy, 
    Target,
    Activity,
    CheckCircle,
    AlertCircle,
    Save,
    Calculator
} from 'lucide-react';
import { userService } from '../services/api';
import { getStoredUser } from '../utils/date';
import '../styles/Dashboard.css'; // Reuse existing dashboard styles for consistency

const Profile = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'Male',
        activityLevel: 'Sedentary',
        goal: 'Maintenance'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setUser(getStoredUser());

                const res = await userService.getProfile();
                if (res.data && Object.keys(res.data).length > 0) {
                    setProfile({
                        weight: res.data.Weight || '',
                        height: res.data.Height || '',
                        age: res.data.Age || '',
                        gender: res.data.Gender || 'Male',
                        activityLevel: res.data.ActivityLevel || 'Sedentary',
                        goal: res.data.Goal || 'Maintenance'
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await userService.updateProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully! ✨' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const calculateTDEE = () => {
        const { weight, height, age, gender, activityLevel } = profile;
        if (!weight || !height || !age) return null;

        let bmr;
        if (gender === 'Male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const multipliers = {
            'Sedentary': 1.2,
            'Lightly Active': 1.375,
            'Moderately Active': 1.55,
            'Very Active': 1.725,
            'Extra Active': 1.9
        };

        const tdee = bmr * (multipliers[activityLevel] || 1.2);
        
        const goalModifiers = {
            'Weight Loss': -500,
            'Maintenance': 0,
            'Weight Gain': 500
        };

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            target: Math.round(tdee + (goalModifiers[profile.goal] || 0))
        };
    };

    const stats = calculateTDEE();

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-emerald-500" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-0">
            {/* Header section with glass background */}
            <motion.div 
                className="bb-welcome-banner mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="d-flex align-items-center gap-4">
                    <div className="rounded-circle p-1 bg-white bg-opacity-30 backdrop-blur shadow-lg">
                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <User size={40} className="text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <h1 className="display-6 fw-black mb-1">Your Health Profile</h1>
                        <p className="lead mb-0 opacity-90">{user?.username || 'Health Enthusiast'} • {user?.email}</p>
                    </div>
                </div>
            </motion.div>

            <div className="row g-4">
                {/* Information Form */}
                <div className="col-12 col-xl-8">
                    <motion.div 
                        className="bb-chart-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="p-2 rounded-3 bg-emerald-50 text-emerald-500">
                                <Target size={24} />
                            </div>
                            <h3 className="h4 fw-black mb-0">Biometric Data</h3>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-2">Weight (kg)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><Scale size={18} className="text-muted" /></span>
                                        <input 
                                            type="number" 
                                            name="weight"
                                            className="form-control bg-light border-0 p-3 fw-bold" 
                                            placeholder="70"
                                            value={profile.weight}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-2">Height (cm)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><Ruler size={18} className="text-muted" /></span>
                                        <input 
                                            type="number" 
                                            name="height"
                                            className="form-control bg-light border-0 p-3 fw-bold" 
                                            placeholder="175"
                                            value={profile.height}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-2">Age (years)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><Calendar size={18} className="text-muted" /></span>
                                        <input 
                                            type="number" 
                                            name="age"
                                            className="form-control bg-light border-0 p-3 fw-bold" 
                                            placeholder="25"
                                            value={profile.age}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-2">Gender</label>
                                    <select 
                                        name="gender" 
                                        className="form-select bg-light border-0 p-3 fw-bold shadow-none"
                                        value={profile.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-2">Activity Level</label>
                                    <select 
                                        name="activityLevel" 
                                        className="form-select bg-light border-0 p-3 fw-bold shadow-none"
                                        value={profile.activityLevel}
                                        onChange={handleChange}
                                    >
                                        <option value="Sedentary">Sedentary (Office job, little exercise)</option>
                                        <option value="Lightly Active">Lightly Active (1-3 days/week exercise)</option>
                                        <option value="Moderately Active">Moderately Active (3-5 days/week exercise)</option>
                                        <option value="Very Active">Very Active (6-7 days/week hard exercise)</option>
                                        <option value="Extra Active">Extra Active (Very intense exercise/Physical job)</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-uppercase text-muted mb-2">Primary Goal</label>
                                    <div className="d-flex gap-2">
                                        {['Weight Loss', 'Maintenance', 'Weight Gain'].map(g => (
                                            <button 
                                                key={g}
                                                type="button"
                                                onClick={() => setProfile({...profile, goal: g})}
                                                className={`btn flex-grow-1 py-3 px-2 rounded-3 fw-bold transition-all ${profile.goal === g ? 'bb-grad-green text-white shadow' : 'bg-light text-muted'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {message && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`alert alert-${message.type} d-flex align-items-center gap-2 mt-4 rounded-4 fw-bold`}
                                    >
                                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-5 text-end">
                                <button 
                                    className="btn bb-grad-green text-white py-3 px-5 rounded-pill fw-black shadow-lg d-inline-flex align-items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    {saving ? 'Updating...' : 'Save Health Profile'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

                {/* Insight Sidebar */}
                <div className="col-12 col-xl-4">
                    <motion.div 
                        className="bb-chart-card mb-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ background: 'var(--bb-grad-energy-soft, linear-gradient(135deg, #fff 0%, #fff7ed 100%))' }}
                    >
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="p-2 rounded-3 bg-orange-50 text-orange-500">
                                <Calculator size={24} />
                            </div>
                            <h3 className="h4 fw-black mb-0">Health Insights</h3>
                        </div>

                        {stats ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-4 bg-white shadow-sm mb-3">
                                    <p className="extra-small fw-black text-muted text-uppercase mb-1">Basal Metabolic Rate (BMR)</p>
                                    <h2 className="fw-black mb-0 text-dark">{stats.bmr} <small className="fs-6 opacity-50">kcal/day</small></h2>
                                    <p className="extra-small text-muted mt-2 mb-0">Calories burned at rest.</p>
                                </div>
                                <div className="p-4 rounded-4 bg-white shadow-sm mb-3 border-start border-emerald-500 border-4">
                                    <p className="extra-small fw-black text-muted text-uppercase mb-1">Total Daily Expenditure (TDEE)</p>
                                    <h2 className="fw-black mb-0 text-emerald-600">{stats.tdee} <small className="fs-6 opacity-50 text-dark">kcal/day</small></h2>
                                    <p className="extra-small text-muted mt-2 mb-0">Calories burned with activity.</p>
                                </div>
                                <div className="p-4 rounded-4 bb-grad-fresh text-white shadow-lg">
                                    <p className="extra-small fw-black text-white text-opacity-75 text-uppercase mb-1">Recommended Daily Target</p>
                                    <h2 className="fw-black mb-0">{stats.target} <small className="fs-6 opacity-75">kcal/day</small></h2>
                                    <div className="d-flex align-items-center gap-2 mt-2">
                                        <Activity size={14} />
                                        <p className="extra-small fw-bold mb-0">Target based on your {profile.goal} goal.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-5 opacity-50">
                                <AlertCircle size={40} className="mb-3" />
                                <p className="fw-bold">Fill in your weight, height, and age to see your insights.</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div 
                        className="bb-chart-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h4 className="fw-black mb-3 small text-uppercase text-muted">Achievements</h4>
                        <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light mb-2">
                            <div className="p-2 rounded-circle bg-amber-100 text-amber-500">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="small fw-bold mb-0">Early Adopter</p>
                                <p className="extra-small text-muted mb-0">Welcome to ByteBalance!</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light opacity-50">
                            <div className="p-2 rounded-circle bg-slate-200 text-slate-500">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="small fw-bold mb-0">Goal Crusher</p>
                                <p className="extra-small text-muted mb-0">Hit your target for 7 days.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
