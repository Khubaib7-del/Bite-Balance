import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Scale, 
    Ruler, 
    User, 
    Zap, 
    Sparkles,
    HeartPulse
} from 'lucide-react';
import '../styles/Calculators.css';

const Calculators = () => {
    const [activeTab, setActiveTab] = useState('bmi');

    return (
        <div className="container-fluid p-0">
            <header className="mb-5">
                <h1 className="display-4 fw-black text-dark mb-1 d-flex align-items-center gap-3">
                    Health Mastery <HeartPulse className="text-emerald-500" />
                </h1>
                <p className="lead text-muted">Precision tools to help your transformation journey.</p>
            </header>

            <div className="bb-calc-tabs">
                <button 
                    className={`bb-calc-tab-btn ${activeTab === 'bmi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bmi')}
                >
                    BMI Index
                </button>
                <button 
                    className={`bb-calc-tab-btn ${activeTab === 'calories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calories')}
                >
                    Metabolic Needs
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'bmi' ? (
                        <motion.div 
                            key="bmi"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <BMICalculator />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="calories"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <CalorieCalculator />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const BMICalculator = () => {
    const [height, setHeight] = useState('175');
    const [weight, setWeight] = useState('70');
    const [result, setResult] = useState(null);

    const calculateBMI = (e) => {
        e.preventDefault();
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        const bmi = w / (h * h);

        let category = '';
        let color = '';
        let percent = 0;
        
        if (bmi < 18.5) { category = 'Underweight'; color = '#60a5fa'; percent = 15; }
        else if (bmi < 25) { category = 'Ideal Weight'; color = '#4ade80'; percent = 35; }
        else if (bmi < 30) { category = 'Overweight'; color = '#fbbf24'; percent = 65; }
        else { category = 'Obese'; color = '#f87171'; percent = 85; }

        setResult({ value: bmi.toFixed(1), category, color, percent });
    };

    return (
        <div className="bb-calc-container">
            <div className="row g-5 align-items-center">
                <div className="col-12 col-md-6">
                    <form onSubmit={calculateBMI}>
                        <div className="bb-input-field">
                            <label>Height (cm)</label>
                            <div className="bb-input-wrapper-lg">
                                <Ruler className="icon" size={24} />
                                <input 
                                    type="number" 
                                    placeholder="175" 
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="bb-input-field">
                            <label>Weight (kg)</label>
                            <div className="bb-input-wrapper-lg">
                                <Scale className="icon" size={24} />
                                <input 
                                    type="number" 
                                    placeholder="70" 
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <motion.button 
                            className="btn bb-grad-green text-white w-100 py-3 rounded-pill fw-black shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Assess Stats
                        </motion.button>
                    </form>
                </div>
                <div className="col-12 col-md-6">
                    <div className="bb-result-card-3d">
                        {result ? (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-100"
                            >
                                <p className="extra-small fw-black text-white text-opacity-75 text-uppercase tracking-widest mb-3">BMI Index Result</p>
                                <h2 className="display-1 fw-black mb-0">{result.value}</h2>
                                <h3 className="h4 fw-bold mb-4" style={{ color: 'white' }}>{result.category}</h3>
                                
                                <div className="bb-bmi-scale">
                                    <div className="bb-bmi-pointer" style={{ left: `${result.percent}%` }} />
                                </div>
                                <div className="d-flex justify-content-between mt-3 extra-small fw-black text-white text-opacity-50">
                                    <span>UNDER</span>
                                    <span>IDEAL</span>
                                    <span>OVER</span>
                                    <span>OBESE</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="opacity-40">
                                <Activity size={80} className="mb-4" />
                                <p className="fw-black">Ready to calculate...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalorieCalculator = () => {
    const [age, setAge] = useState('25');
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');
    const [gender, setGender] = useState('male');
    const [activity, setActivity] = useState('1.55');
    const [result, setResult] = useState(null);

    const calculateCalories = (e) => {
        e.preventDefault();
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        const tdee = bmr * parseFloat(activity);
        setResult({ tdee: tdee.toFixed(0), bmr: bmr.toFixed(0) });
    };

    return (
        <div className="bb-calc-container">
            <div className="row g-5">
                <div className="col-12 col-md-6">
                    <form onSubmit={calculateCalories}>
                        <div className="row g-3 mb-2">
                            <div className="col-6">
                                <div className="bb-input-field">
                                    <label>Age</label>
                                    <div className="bb-input-wrapper-lg">
                                        <User className="icon" size={24} />
                                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bb-input-field">
                                    <label>Gender</label>
                                    <div className="bb-input-wrapper-lg ps-3">
                                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                            <option value="male">Energetic Male</option>
                                            <option value="female">Strong Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row g-3 mb-2">
                            <div className="col-6">
                                <div className="bb-input-field">
                                    <label>Weight (kg)</label>
                                    <div className="bb-input-wrapper-lg">
                                        <Scale className="icon" size={24} />
                                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bb-input-field">
                                    <label>Height (cm)</label>
                                    <div className="bb-input-wrapper-lg">
                                        <Ruler className="icon" size={24} />
                                        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bb-input-field">
                            <label>Activity Intensity</label>
                            <div className="bb-input-wrapper-lg ps-3">
                                <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                                    <option value="1.2">Mostly Sedentary 🛋️</option>
                                    <option value="1.375">Light Activity (1-3 days) 🚶</option>
                                    <option value="1.55">Moderate Heat (3-5 days) 🏃</option>
                                    <option value="1.725">Elite Training (6-7 days) 🏋️</option>
                                </select>
                            </div>
                        </div>
                        <motion.button 
                            className="btn btn-dark w-100 py-3 rounded-pill fw-black shadow-lg"
                            whileHover={{ scale: 1.02 }}
                        >
                            Generate Metabolic Profile
                        </motion.button>
                    </form>
                </div>
                <div className="col-12 col-md-6">
                    <div className="bb-result-card-3d" style={{ background: 'var(--bb-grad-energy)' }}>
                        {result ? (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="d-flex align-items-center gap-2 justify-content-center mb-3">
                                    <Sparkles size={24} />
                                    <p className="extra-small fw-black text-white text-opacity-75 text-uppercase tracking-widest mb-0">Total Daily Expenditure</p>
                                </div>
                                <h2 className="display-1 fw-black mb-1">{result.tdee}</h2>
                                <h3 className="h4 fw-bold mb-4">kcal / day</h3>
                                
                                <div className="bg-white bg-opacity-20 rounded-4 p-4 border border-white border-opacity-30 text-start">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small fw-bold">Basal Metabolic Rate:</span>
                                        <span className="fw-black">{result.bmr} kcal</span>
                                    </div>
                                    <hr className="my-2 border-white border-opacity-20" />
                                    <p className="extra-small mb-0 opacity-80">
                                        This is the energy your body burns just to stay alive at rest. Your total activity adds to this number.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="opacity-40">
                                <Zap size={80} className="mb-4" />
                                <p className="fw-black">Analyzing Metabolism...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculators;
