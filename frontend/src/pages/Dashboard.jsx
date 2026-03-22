import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Flame, 
    Droplets, 
    Sparkles, 
    TrendingUp, 
    Utensils,
    Zap,
    Coffee
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    BarChart,
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { mealService, userService } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [recentMeals, setRecentMeals] = useState([]);
    const [calorieData, setCalorieData] = useState([]);
    const [user, setUser] = useState(null);
    const [hoveredMacro, setHoveredMacro] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userJson = localStorage.getItem('user');
                setUser(JSON.parse(userJson));

                const [sumRes, planRes, weeklyRes] = await Promise.all([
                    mealService.getNutritionSummary(today),
                    mealService.getMealPlanByDate(today),
                    mealService.getWeeklySummary()
                ]);

                setSummary(sumRes.data);
                setRecentMeals(planRes.data.items || []);
                // Normalize weekly data to 7 days
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    last7Days.push({
                        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fats: 0,
                        target: 2000
                    });
                }

                const rawData = Array.isArray(weeklyRes.data) ? weeklyRes.data : [];
                const mergedData = last7Days.map(item => {
                    const find = rawData.find(r => r.day === item.day);
                    return find ? { 
                        ...item, 
                        calories: find.calories,
                        protein: find.protein || 0,
                        carbs: find.carbs || 0,
                        fats: find.fats || 0
                    } : item;
                });

                setCalorieData(mergedData);
            } catch (err) {
                console.error('Dashboard data fetch failed', err);
            }
        };
        fetchData();
    }, [today]);

    const statCards = [
        { 
            title: "Calories", 
            value: summary?.TotalCalories?.toFixed(0) || "0", 
            target: "2,000", 
            unit: "kcal", 
            icon: <Flame />, 
            color: "var(--bb-orange-500)", 
            bgColor: "var(--bb-orange-50)",
            grad: "var(--bb-grad-energy)",
            progress: (summary?.TotalCalories / 2000) * 100
        },
        { 
            title: "Protein", 
            value: summary?.TotalProtein?.toFixed(0) || "0", 
            target: "120", 
            unit: "g", 
            icon: <Zap />, 
            color: "var(--bb-emerald-500)", 
            bgColor: "var(--bb-emerald-50)",
            grad: "var(--bb-grad-fresh)",
            progress: (summary?.TotalProtein / 120) * 100
        },
        { 
            title: "Hydration", 
            value: "6", 
            target: "8", 
            unit: "glasses", 
            icon: <Droplets />, 
            color: "var(--bb-cyan-500)", 
            bgColor: "var(--bb-cyan-50)",
            grad: "var(--bb-grad-hydration)",
            progress: 75
        },
        { 
            title: "Energy", 
            value: "90", 
            target: "100", 
            unit: "%", 
            icon: <Sparkles />, 
            color: "var(--bb-amber-500)", 
            bgColor: "var(--bb-orange-50)",
            grad: "var(--bb-grad-sunlight)",
            progress: 90
        }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bb-custom-tooltip">
                    <p className="extra-small fw-black text-uppercase tracking-widest mb-2 opacity-50">{label}</p>
                    {payload.map((entry, index) => {
                        const isHovered = hoveredMacro === entry.dataKey;
                        return (
                            <div 
                                key={index} 
                                className={`d-flex align-items-center justify-content-between gap-4 mb-2 transition-all ${isHovered ? 'scale-110 opacity-100' : 'opacity-60'}`}
                                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'left' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ 
                                        width: 10, 
                                        height: 10, 
                                        borderRadius: '50%', 
                                        background: entry.color,
                                        boxShadow: isHovered ? `0 0 10px ${entry.color}` : 'none'
                                    }} />
                                    <span className={`small fw-bold ${isHovered ? 'text-dark underline' : 'text-muted'}`}>{entry.name}:</span>
                                </div>
                                <span className={`small fw-black ${isHovered ? 'text-emerald-600' : 'text-dark'}`}>{entry.value}{entry.name === 'calories' ? ' kcal' : 'g'}</span>
                            </div>
                        );
                    })}
                    {hoveredMacro && (
                        <div className="mt-3 pt-2 border-top extra-small fw-bold text-center text-emerald-500 animate-pulse">
                            ✨ Focused on {hoveredMacro}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid p-0">
            {/* SVG Filters for Glow */}
            <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="gradProtein" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--bb-emerald-400)" />
                        <stop offset="100%" stopColor="var(--bb-emerald-600)" />
                    </linearGradient>
                    <linearGradient id="gradCarbs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--bb-amber-400)" />
                        <stop offset="100%" stopColor="var(--bb-amber-600)" />
                    </linearGradient>
                    <linearGradient id="gradFats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--bb-orange-400)" />
                        <stop offset="100%" stopColor="var(--bb-orange-600)" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Welcome Banner */}
            <motion.div 
                className="bb-welcome-banner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="d-flex align-items-center justify-content-between position-relative z-1">
                    <div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="display-4 mb-2"
                        >
                            👋
                        </motion.div>
                        <h1 className="display-5 fw-black mb-1">Welcome back, {user?.username || 'Health Warrior'}!</h1>
                        <p className="lead opacity-90 mb-0">You're doing amazing! Keep up the healthy lifestyle 🌿</p>
                        
                        <div className="d-flex gap-3 mt-4">
                            <div className="bg-white bg-opacity-20 backdrop-blur rounded-pill px-3 py-1 border border-white border-opacity-30 small text-white fw-bold d-flex align-items-center gap-2 shadow-sm">
                                <span>🎯</span> 75% to your goal!
                            </div>
                            <div className="bg-white bg-opacity-20 backdrop-blur rounded-pill px-3 py-1 border border-white border-opacity-30 small text-white fw-bold d-flex align-items-center gap-2 shadow-sm">
                                <span>🔥</span> 7 day streak
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stat Cards Grid */}
            <div className="bb-dashboard-grid">
                {statCards.map((card, idx) => (
                    <motion.div 
                        key={idx}
                        className="bb-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ y: -8 }}
                    >
                        <div className="icon-box" style={{ background: card.bgColor, color: card.color }}>
                            {card.icon}
                        </div>
                        <p className="extra-small fw-black text-muted text-uppercase mb-1">{card.title}</p>
                        <h3 className="h2 fw-black mb-0">
                            {card.value} 
                            <small className="fs-6 opacity-30 ms-1 fw-bold">/ {card.target} {card.unit}</small>
                        </h3>
                        <div className="bb-progress-bar-container">
                            <motion.div 
                                className="bb-progress-bar-fill"
                                style={{ background: card.grad }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(card.progress, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Today's Fresh Menu */}
                <div className="col-12 col-xl-8">
                    <div className="bb-fresh-menu-card h-100">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="h4 fw-black text-dark mb-0">Today's Fresh Menu 🍽️</h3>
                            <span className="badge bb-grad-green rounded-pill px-3 py-2 fw-bold">{recentMeals.length} meals</span>
                        </div>

                        <div className="row g-3">
                            {recentMeals.length > 0 ? (
                                recentMeals.map((meal, idx) => (
                                    <div key={idx} className="col-12 col-md-6">
                                        <motion.div 
                                            className="meal-item"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.1 }}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div 
                                                    className="meal-icon-box"
                                                    style={{ 
                                                        background: meal.MealType === 'Breakfast' ? 'var(--bb-orange-50)' : 'var(--bb-green-50)',
                                                        color: meal.MealType === 'Breakfast' ? 'var(--bb-orange-500)' : 'var(--bb-emerald-500)'
                                                    }}
                                                >
                                                    {meal.MealType === 'Breakfast' ? <Coffee size={24} /> : <Utensils size={24} />}
                                                </div>
                                                <div>
                                                    <p className="fw-bold text-dark mb-0">{meal.FoodName}</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="extra-small text-muted fw-bold text-uppercase">{meal.MealType}</span>
                                                        <span className="extra-small text-primary fw-bold">{meal.Quantity} servings</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <p className="h4 fw-black text-dark mb-0" style={{ color: 'var(--bb-orange-600)' }}>{meal.Calories * meal.Quantity}</p>
                                                <p className="extra-small text-muted fw-bold text-uppercase mb-0">kcal</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5 opacity-50">
                                    <Utensils size={48} className="mb-3" />
                                    <p className="fw-bold">No meals logged for today yet.</p>
                                    <button className="btn bb-grad-green text-white rounded-pill px-4 mt-2">Log Daily Plan</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nutrition Balance */}
                <div className="col-12 col-xl-4">
                    <div className="bb-chart-card h-100" style={{ background: 'linear-gradient(to bottom, #ffffff, var(--bb-emerald-50))' }}>
                        <h3 className="h5 fw-black text-dark mb-4">Nutrition Balance 🥗</h3>
                        
                        {[
                            { label: "Protein", current: summary?.TotalProtein || 0, goal: 120, unit: "g", icon: "💪", grad: "var(--bb-grad-fresh)" },
                            { label: "Carbs", current: summary?.TotalCarbohydrates || 0, goal: 250, unit: "g", icon: "🌾", grad: "var(--bb-grad-sunlight)" },
                            { label: "Fats", current: summary?.TotalFats || 0, goal: 70, unit: "g", icon: "🥑", grad: "var(--bb-grad-energy)" }
                        ].map((node, i) => (
                            <div key={i} className="bb-nutrition-row">
                                <div className="bb-nutrition-label">
                                    <span>{node.icon} {node.label}</span>
                                    <span className="text-gradient" style={{ background: node.grad, backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                                        {node.current?.toFixed(0)}{node.unit} / {node.goal}{node.unit}
                                    </span>
                                </div>
                                <div className="bb-progress-bar-container" style={{ height: '12px' }}>
                                    <motion.div 
                                        className="bb-progress-bar-fill"
                                        style={{ background: node.grad }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((node.current / node.goal) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 1 + i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="mt-5 p-3 rounded-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <p className="small fw-bold text-emerald-600 mb-0">🌟 You're crushing it! Keep eating fresh & healthy!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Progress JOURNEY */}
            <div className="row mb-4">
                <div className="col-12 col-xl-7">
                    <div className="bb-chart-card h-100">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h3 className="h4 fw-black text-dark mb-1">Weekly Progress Journey 📊</h3>
                                <p className="text-muted small">Your calorie journey over the last 7 days</p>
                            </div>
                            <div className="bg-light p-3 rounded-circle">
                                <TrendingUp className="text-emerald-500" />
                            </div>
                        </div>

                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={calorieData}>
                                    <defs>
                                        <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="calories" 
                                        stroke="#10b981" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorCal)" 
                                        filter="url(#glow)"
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="target" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2} 
                                        strokeDasharray="5 5"
                                        fill="none"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-5">
                    <div className="bb-chart-card h-100">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h3 className="h4 fw-black text-dark mb-1">Macro Distribution 🍖</h3>
                                <p className="text-muted small">Daily breakdown of nutrients</p>
                            </div>
                        </div>

                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={calorieData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                                    <Bar 
                                        dataKey="protein" 
                                        name="Protein" 
                                        stackId="a" 
                                        fill="url(#gradProtein)" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={25} 
                                        filter="url(#glow)"
                                        onMouseEnter={() => setHoveredMacro('protein')}
                                        onMouseLeave={() => setHoveredMacro(null)}
                                    />
                                    <Bar 
                                        dataKey="carbs" 
                                        name="Carbs" 
                                        stackId="a" 
                                        fill="url(#gradCarbs)" 
                                        radius={[0, 0, 0, 0]} 
                                        barSize={25} 
                                        filter="url(#glow)"
                                        onMouseEnter={() => setHoveredMacro('carbs')}
                                        onMouseLeave={() => setHoveredMacro(null)}
                                    />
                                    <Bar 
                                        dataKey="fats" 
                                        name="Fats" 
                                        stackId="a" 
                                        fill="url(#gradFats)" 
                                        radius={[0, 0, 4, 4]} 
                                        barSize={25} 
                                        filter="url(#glow)"
                                        onMouseEnter={() => setHoveredMacro('fats')}
                                        onMouseLeave={() => setHoveredMacro(null)}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="d-flex justify-content-center gap-4 mt-3">
                            <div className="d-flex align-items-center gap-2 extra-small fw-bold">
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bb-emerald-500)', boxShadow: '0 0 10px var(--bb-emerald-400)' }} /> Protein
                            </div>
                            <div className="d-flex align-items-center gap-2 extra-small fw-bold">
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bb-amber-500)', boxShadow: '0 0 10px var(--bb-amber-400)' }} /> Carbs
                            </div>
                            <div className="d-flex align-items-center gap-2 extra-small fw-bold">
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bb-orange-500)', boxShadow: '0 0 10px var(--bb-orange-400)' }} /> Fats
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
