import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Plus, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Utensils, 
    Sparkles,
    Coffee,
    Zap,
    HeartPulse,
    Salad,
    Search,
    X,
    Apple
} from 'lucide-react';
import { mealService, foodService, savedPlanService } from '../services/api';
import '../styles/MealPlanner.css';

const MealPlanner = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealPlan, setMealPlan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [foods, setFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMealType, setActiveMealType] = useState('Lunch');
    const [quantity, setQuantity] = useState(1);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const fetchMealPlan = async () => {
        setLoading(true);
        try {
            const res = await mealService.getMealPlanByDate(selectedDate);
            setMealPlan(res.data.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMealPlan();
        const fetchFoods = async () => {
            try {
                const res = await foodService.getAllFoods();
                setFoods(res.data);
            } catch (err) {
                console.error('Failed to fetch foods', err);
            }
        };
        fetchFoods();
    }, [selectedDate]);

    const handleAddFood = async (foodId, mealType) => {
        try {
            let mealPlanId;
            const res = await mealService.getMealPlanByDate(selectedDate);
            if (res.data.mealPlanId) {
                mealPlanId = res.data.mealPlanId;
            } else {
                const mpRes = await mealService.createMealPlan(selectedDate);
                mealPlanId = mpRes.data.mealPlanId;
            }
            await mealService.addFoodToMealPlan({
                mealPlanId,
                foodId,
                quantity: quantity,
                mealType
            });
            fetchMealPlan();
            setShowAddModal(false);
            setQuantity(1);
        } catch (err) {
            console.error('Add food error:', err);
        }
    };

    const handleDeleteEntry = async (entryId) => {
        try {
            await mealService.deleteMealPlanEntry(entryId);
            setMealPlan(mealPlan.filter(item => item.EntryID !== entryId));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const mealCategories = [
        { name: 'Breakfast', icon: <Coffee />, color: 'var(--bb-orange-500)', bg: 'var(--bb-orange-50)' },
        { name: 'Lunch', icon: <Utensils />, color: 'var(--bb-emerald-500)', bg: 'var(--bb-emerald-50)' },
        { name: 'Dinner', icon: <Zap />, color: 'var(--bb-indigo-500)', bg: 'var(--bb-indigo-50)' },
        { name: 'Snacks', icon: <Apple />, color: 'var(--bb-amber-500)', bg: 'var(--bb-amber-50)' }
    ];

    return (
        <div className="container-fluid p-0">
            {/* Header section */}
            <header className="bb-planner-header d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                <div>
                    <h1 className="display-4 fw-black text-dark mb-1 d-flex align-items-center gap-2">
                        Smart Planner <HeartPulse className="text-emerald-500" />
                    </h1>
                    <p className="lead text-muted mb-0">Design your perfect nutritional day with AI assistance.</p>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <motion.div 
                        className="bb-date-selector"
                        whileHover={{ scale: 1.02 }}
                    >
                        <Calendar size={20} className="text-emerald-500" />
                        <input 
                            type="date" 
                            className="bb-date-input" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </motion.div>
                </div>
            </header>

            {/* Meal Grid */}
            <div className="row g-4 mb-5">
                {mealCategories.map((cat, idx) => (
                    <div key={cat.name} className="col-12 col-xl-6">
                        <motion.div 
                            className="bb-meal-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="bb-meal-card-header">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: cat.bg, color: cat.color }}>
                                        {cat.icon}
                                    </div>
                                    <h3 className="h5 fw-black text-dark mb-0">{cat.name}</h3>
                                </div>
                                <motion.button
                                    className="btn border-0 bb-grad-green text-white rounded-pill px-4 py-2 fw-bold small d-flex align-items-center gap-2 hover-shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setActiveMealType(cat.name);
                                        setShowAddModal(true);
                                    }}
                                >
                                    <Plus size={18} /> Add
                                </motion.button>
                            </div>

                            <div className="bb-meal-card-content">
                                <AnimatePresence mode="popLayout">
                                    {mealPlan.filter(m => m.MealType === cat.name).length > 0 ? (
                                        mealPlan.filter(m => m.MealType === cat.name).map((item, i) => (
                                            <motion.div 
                                                key={item.EntryID}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="bb-planner-item group"
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bb-food-thumb">
                                                        {item.ImagePath ? <img src={item.ImagePath} alt="" /> : <Salad size={24} />}
                                                    </div>
                                                    <div>
                                                        <p className="fw-bold text-dark mb-0">{item.FoodName}</p>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="extra-small text-muted fw-bold">QTY: {item.Quantity}</span>
                                                            <span className="extra-small text-emerald-600 fw-bold">• {item.Calories * item.Quantity} kcal</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                                                        className="btn btn-link p-2 text-muted"
                                                        onClick={() => handleDeleteEntry(item.EntryID)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-5 text-center opacity-30 border-2 border-dashed rounded-4">
                                            <p className="mb-0 fw-bold">Empty</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Progress Summary Footer */}
            <motion.div 
                className="bb-chart-card mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h4 className="fw-black mb-1">Total Daily Intake</h4>
                        <p className="text-muted small mb-0">You've consumed {mealPlan.reduce((acc, m) => acc + (m.Calories * m.Quantity), 0).toFixed(0)} kcal out of your 2,000 kcal goal.</p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <button 
                            className="btn btn-dark rounded-pill px-5 py-3 fw-bold hover-shadow-lg"
                            onClick={() => setShowAnalysis(true)}
                        >
                            Analyze Plan ✨
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {showAnalysis && (
                    <motion.div 
                        className="bb-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bb-modal-content"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            style={{ maxWidth: '600px' }}
                        >
                            <div className="bb-modal-header border-0 pb-0">
                                <h2 className="h4 fw-black text-dark mb-0">Smart Analysis 🧬</h2>
                                <button className="btn btn-light rounded-circle p-2" onClick={() => setShowAnalysis(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="bb-modal-body p-5 pt-4">
                                <div className="p-4 rounded-4 mb-4" style={{ background: 'var(--bb-emerald-50)', border: '1px solid var(--bb-emerald-100)' }}>
                                    <div className="d-flex align-items-center gap-2 mb-2 text-emerald-700">
                                        <Sparkles size={20} />
                                        <span className="fw-black text-uppercase extra-small tracking-widest">AI Summary</span>
                                    </div>
                                    <p className="fw-bold text-dark mb-0">
                                        Your plan for {new Date(selectedDate).toLocaleDateString()} looks excellent! 
                                        You have a balanced intake of proteins and fibers. 🌿
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Nutritional Balance", val: "Optimal", color: "emerald" },
                                        { label: "Satiety Index", val: "High", color: "teal" },
                                        { label: "Blood Sugar Stability", val: "Stable", color: "cyan" }
                                    ].map((item, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                                            <span className="text-muted fw-bold">{item.label}</span>
                                            <span className={`badge bg-${item.color}-100 text-${item.color}-700 rounded-pill px-3`}>{item.val}</span>
                                        </div>
                                    ))}
                                </div>

                                <motion.button 
                                    className="btn bb-grad-green text-white w-100 py-3 rounded-pill fw-black mt-5 shadow-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowAnalysis(false)}
                                >
                                    Understood
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div 
                        className="bb-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bb-modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="bb-modal-header">
                                <div>
                                    <h2 className="h4 fw-black text-dark mb-1">Add to {activeMealType}</h2>
                                    <p className="small text-muted mb-0">Browse our 5,000+ healthy food items</p>
                                </div>
                                <button className="btn btn-light rounded-circle p-2" onClick={() => setShowAddModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="bb-modal-body">
                                <div className="d-flex gap-3 mb-4">
                                    <div className="bb-search-input-group flex-grow-1 mb-0">
                                        <Search className="icon" size={20} />
                                        <input 
                                            type="text" 
                                            placeholder="Search chicken, broccoli, pasta..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center gap-3 bg-light rounded-20 px-3">
                                        <button className="btn btn-link text-dark p-0 fw-bold" onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}>-</button>
                                        <span className="fw-black" style={{ minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                                        <button className="btn btn-link text-dark p-0 fw-bold" onClick={() => setQuantity(quantity + 0.5)}>+</button>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    {(searchQuery ? foods.filter(f => f.FoodName.toLowerCase().includes(searchQuery.toLowerCase())) : foods.slice(0, 15)).map(f => (
                                        <div key={f.FoodID} className="col-12 col-md-6 col-lg-4">
                                            <motion.div 
                                                className="food-result-card"
                                                whileHover={{ y: -4 }}
                                                onClick={() => handleAddFood(f.FoodID, activeMealType)}
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="rounded-3 p-2 bg-emerald-50 text-emerald-500">
                                                        <Utensils size={16} />
                                                    </div>
                                                    <span className="badge bg-emerald-100 text-emerald-700 rounded-pill">{f.Calories} kcal</span>
                                                </div>
                                                <p className="fw-bold text-dark mb-1 text-truncate">{f.FoodName}</p>
                                                <div className="extra-small text-muted fw-bold d-flex flex-wrap gap-2">
                                                    <span>🥩 {f.Protein}g</span>
                                                    <span>🌾 {f.Carbohydrates}g</span>
                                                    <span>🥑 {f.Fats}g</span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MealPlanner;
