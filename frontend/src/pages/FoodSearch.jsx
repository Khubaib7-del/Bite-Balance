import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Plus, 
    Filter, 
    ChevronRight, 
    Zap, 
    Flame, 
    Droplets, 
    X,
    Sparkles,
    ChefHat,
    Salad
} from 'lucide-react';
import { foodService, mealService } from '../services/api';
import '../styles/FoodSearch.css';

const FoodSearch = () => {
    const [query, setQuery] = useState('');
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [mealType, setMealType] = useState('Lunch');
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const handleAddFood = async () => {
        if (!selectedFood) return;
        setAdding(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            let mealPlanId;
            const res = await mealService.getMealPlanByDate(today);

            if (res.data.mealPlanId) {
                mealPlanId = res.data.mealPlanId;
            } else {
                const mpRes = await mealService.createMealPlan(today);
                mealPlanId = mpRes.data.mealPlanId;
            }

            await mealService.addFoodToMealPlan({
                mealPlanId,
                foodId: selectedFood.FoodID,
                quantity: quantity,
                mealType: mealType
            });
            setSelectedFood(null);
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    useEffect(() => {
        const loadFoods = async () => {
            setLoading(true);
            try {
                const res = query
                    ? await foodService.searchFoods(query)
                    : await foodService.getAllFoods();

                setFoods(query ? res.data : res.data.slice(0, 12));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            loadFoods();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <header className="mb-5 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="display-4 fw-black text-dark mb-2">Explore Fresh Flavors 🥗</h1>
                    <p className="lead text-muted">Discover nutritional insights and plan your meals with ease.</p>
                </motion.div>
                
                <div className="bb-search-container mt-4">
                    <div className="bb-search-box">
                        <Search className="text-emerald-500" size={24} />
                        <input 
                            type="text" 
                            placeholder="What are you craving today?" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold d-none d-md-block">
                            Search
                        </button>
                    </div>
                </div>
            </header>

            {/* Results Grid */}
            <div className="bb-food-grid">
                <AnimatePresence>
                    {foods.map((food, idx) => (
                        <motion.div 
                            key={food.FoodID}
                            className="bb-floating-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: (idx % 8) * 0.05 }}
                        >
                            <div className="bb-food-image-wrapper">
                                {food.ImagePath ? (
                                    <img src={food.ImagePath} alt={food.FoodName} />
                                ) : (
                                    <ChefHat size={48} className="opacity-20" />
                                )}
                            </div>

                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h3 className="h5 fw-black text-dark mb-1 text-truncate" style={{ maxWidth: '180px' }}>{food.FoodName}</h3>
                                    <div className="d-flex align-items-center gap-2">
                                        <Sparkles size={12} className="text-amber-500" />
                                        <span className="extra-small text-muted fw-bold">NUTRITION SCORE: 9.2</span>
                                    </div>
                                </div>
                                <motion.button 
                                    className="bb-quick-add-btn"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedFood(food)}
                                >
                                    <Plus size={20} />
                                </motion.button>
                            </div>

                            <div className="bg-emerald-50 rounded-4 p-3 mb-3 text-center border border-emerald-100">
                                <span className="h4 fw-black text-emerald-600 mb-0">{food.Calories}</span>
                                <span className="extra-small text-emerald-500 fw-black ms-2 text-uppercase">kcal / 100g</span>
                            </div>

                            <div className="d-flex gap-2">
                                <div className="bb-macro-pill">
                                    <span className="label">Prot</span>
                                    <span className="value">{food.Protein}g</span>
                                </div>
                                <div className="bb-macro-pill">
                                    <span className="label">Carb</span>
                                    <span className="value">{food.Carbohydrates}g</span>
                                </div>
                                <div className="bb-macro-pill">
                                    <span className="label">Fat</span>
                                    <span className="value">{food.Fats}g</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {foods.length === 0 && !loading && (
                <div className="text-center py-5">
                    <div className="bg-white bg-opacity-40 backdrop-blur rounded-5 p-5 d-inline-block border-white border">
                        <Salad size={64} className="text-muted opacity-30 mb-4" />
                        <h4 className="fw-black text-dark">No matches found</h4>
                        <p className="text-muted">Try a different keyword or check for typos.</p>
                        <button onClick={() => setQuery('')} className="btn bb-grad-green text-white rounded-pill px-4 mt-2">Clear Search</button>
                    </div>
                </div>
            )}

            {/* Selection Modal */}
            <AnimatePresence>
                {selectedFood && (
                    <div className="bb-modal-overlay">
                        <motion.div 
                            className="bb-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ maxWidth: '500px' }}
                        >
                            <div className="bb-modal-header">
                                <h2 className="h4 fw-black text-dark mb-0">Add to Daily Plan ✨</h2>
                                <button className="btn btn-light rounded-circle p-2" onClick={() => setSelectedFood(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="bb-modal-body text-center">
                                <div className="mb-4">
                                    <div className="bg-emerald-50 rounded-circle d-inline-flex p-4 mb-3 border border-emerald-100">
                                        <ChefHat size={48} className="text-emerald-500" />
                                    </div>
                                    <h3 className="h4 fw-black text-dark mb-1">{selectedFood.FoodName}</h3>
                                    <p className="text-muted">How much are you having?</p>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6 text-start">
                                        <label className="extra-small fw-black text-muted mb-2">Meal Category</label>
                                        <select 
                                            className="form-select rounded-4 py-3 bg-light border-0 fw-bold"
                                            value={mealType}
                                            onChange={(e) => setMealType(e.target.value)}
                                        >
                                            <option>Breakfast</option>
                                            <option>Lunch</option>
                                            <option>Dinner</option>
                                            <option>Snacks</option>
                                        </select>
                                    </div>
                                    <div className="col-6 text-start">
                                        <label className="extra-small fw-black text-muted mb-2">Total Portions</label>
                                        <div className="d-flex align-items-center gap-2 bg-light p-1 rounded-4">
                                            <button className="btn btn-white shadow-sm rounded-3 py-2 flex-grow-1 fw-black" onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}>-</button>
                                            <span className="px-2 fw-black" style={{ minWidth: '40px' }}>{quantity}</span>
                                            <button className="btn btn-white shadow-sm rounded-3 py-2 flex-grow-1 fw-black" onClick={() => setQuantity(quantity + 0.5)}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    className="btn bb-grad-green text-white w-100 py-3 rounded-pill fw-black shadow-lg hover-shadow-xl"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddFood}
                                    disabled={adding}
                                >
                                    {adding ? 'Securing your nutrients...' : 'Add to My Journey'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodSearch;
