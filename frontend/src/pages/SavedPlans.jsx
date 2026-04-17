import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bookmark, 
    Trash2, 
    CheckCircle, 
    Clock, 
    Sparkles,
    Zap,
    History
} from 'lucide-react';
import { savedPlanService, mealService } from '../services/api';
import { getLocalISODate } from '../utils/date';
import '../styles/SavedPlans.css';

const SavedPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await savedPlanService.getSavedPlans();
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await savedPlanService.deletePlan(id);
            setPlans(plans.filter(p => p.PlanID !== id));
            setMessage('Journey template removed.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLoad = async (planId) => {
        try {
            const date = getLocalISODate();
            await mealService.applySavedPlan(planId, date);
            setMessage('Success! Template applied to your daily plan. ✨');
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container-fluid p-0">
            <header className="mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                <div>
                    <h1 className="display-4 fw-black text-dark mb-1">Journey Templates 📁</h1>
                    <p className="lead text-muted">Quickly access and apply your favorite nutritional architectures.</p>
                </div>
                <div className="bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-3">
                    <History className="text-emerald-500" size={20} />
                    <span className="fw-black text-dark">{plans.length} Saved Scenarios</span>
                </div>
            </header>

            <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="alert bb-grad-green text-white border-0 rounded-4 px-4 py-3 mb-5 d-flex align-items-center gap-3 shadow-lg"
                    >
                        <CheckCircle size={22} />
                        <span className="fw-black">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="row g-4">
                {plans.map((plan, idx) => (
                    <div key={plan.PlanID} className="col-12 col-md-6 col-lg-4">
                        <motion.div 
                            className="bb-plan-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="bb-plan-icon-wrapper">
                                <Bookmark size={32} />
                            </div>

                            <div className="bb-plan-meta">
                                <Clock size={14} />
                                <span>SAVED ON {new Date(plan.CreatedAt).toLocaleDateString().toUpperCase()}</span>
                            </div>

                            <h3 className="h4 fw-black text-dark mb-3">{plan.PlanName}</h3>
                            
                            <div className="bg-light rounded-4 p-3 mb-4 mt-auto border border-white">
                                <div className="d-flex align-items-center gap-2 mb-1 text-emerald-600">
                                    <Sparkles size={14} />
                                    <span className="extra-small fw-black text-uppercase">Optimal Performance</span>
                                </div>
                                <p className="small text-muted mb-0">Contains pre-calculated macros for consistent progress tracking.</p>
                            </div>

                            <div className="d-flex gap-3">
                                <motion.button
                                    onClick={() => handleLoad(plan.PlanID)}
                                    className="bb-plan-load-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Apply Template <Zap size={18} />
                                </motion.button>
                                <motion.button
                                    onClick={() => handleDelete(plan.PlanID)}
                                    className="bb-plan-delete-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Trash2 size={24} />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                ))}

                {plans.length === 0 && !loading && (
                    <div className="col-12 py-5 text-center mt-5">
                        <div className="p-5 bg-white bg-opacity-40 backdrop-blur rounded-5 border-white border d-inline-block shadow-sm">
                            <Bookmark size={64} className="text-muted opacity-30 mb-4" />
                            <h4 className="fw-black text-dark">No Blueprints Found</h4>
                            <p className="text-muted mb-0">Start by saving a daily plan from your planner to see it here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPlans;
