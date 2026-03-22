import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend,
    Sector
} from 'recharts';
import { 
    Flame, 
    Beef, 
    Wheat, 
    Droplets, 
    Calendar, 
    Activity, 
    Sparkles,
    TrendingUp,
    Info,
    ChevronDown,
    Zap
} from 'lucide-react';
import { mealService } from '../services/api';
import '../styles/NutritionSummary.css';

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#1f2937" fontWeight="900" fontSize="24">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

const NutritionSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await mealService.getNutritionSummary(today);
                setSummary(res.data);
            } catch (err) {
                console.error('Failed to fetch summary', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [today]);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const macroData = summary ? [
        { name: 'Protein', value: summary.TotalProtein || 0, color: 'var(--bb-emerald-500)' },
        { name: 'Carbs', value: summary.TotalCarbohydrates || 0, color: 'var(--bb-orange-500)' },
        { name: 'Fats', value: summary.TotalFats || 0, color: 'var(--bb-indigo-500)' },
    ] : [];

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <header className="mb-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                <div>
                    <h1 className="display-4 fw-black text-dark mb-1">Nutrition Journey 🧬</h1>
                    <p className="lead text-muted">A comprehensive breakdown of your nutritional intake.</p>
                </div>
                <div className="bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-3">
                    <Calendar className="text-emerald-500" size={20} />
                    <span className="fw-black text-dark">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </header>

            <div className="row g-4 mb-5">
                {/* Visual Macro Breakdown */}
                <div className="col-12 col-xl-7">
                    <motion.div 
                        className="bb-chart-container h-100"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="h4 fw-black text-dark mb-4 d-flex align-items-center gap-2">
                            Macro Breakdown <Sparkles size={20} className="text-amber-500" />
                        </h3>
                        
                        <div style={{ height: '400px', width: '100%' }}>
                            {macroData.some(m => m.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={macroData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={110}
                                            outerRadius={150}
                                            paddingAngle={8}
                                            dataKey="value"
                                            onMouseEnter={onPieEnter}
                                        >
                                            {macroData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                    <Activity size={64} className="opacity-20 mb-4" />
                                    <p className="fw-black">No Data Available Today</p>
                                    <p className="small">Start logging your meals to see the breakdown!</p>
                                </div>
                            )}
                        </div>

                        <div className="row mt-4 pt-4 border-top">
                            {macroData.map((m, i) => (
                                <div key={i} className="col-4 text-center">
                                    <p className="small fw-black text-muted text-uppercase mb-1">{m.name}</p>
                                    <h4 className="fw-black" style={{ color: m.color }}>{m.value.toFixed(1)}g</h4>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* detailed Stats Summary */}
                <div className="col-12 col-xl-5">
                    <div className="row g-4">
                        {[
                            { label: "Calories", value: summary?.TotalCalories || 0, unit: "kcal", icon: <Flame />, color: "var(--bb-orange-500)", bg: "var(--bb-orange-50)" },
                            { label: "Protein", value: summary?.TotalProtein || 0, unit: "g", icon: <Beef />, color: "var(--bb-emerald-500)", bg: "var(--bb-emerald-50)" },
                            { label: "Fiber", value: (summary?.TotalCarbohydrates * 0.1) || 0, unit: "g", icon: <Wheat />, color: "var(--bb-amber-500)", bg: "var(--bb-amber-50)" },
                            { label: "Water", value: 1.5, unit: "L", icon: <Droplets />, color: "var(--bb-cyan-500)", bg: "var(--bb-cyan-50)" }
                        ].map((stat, i) => (
                            <div key={i} className="col-6">
                                <motion.div 
                                    className="bb-stat-item-premium"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                >
                                    <div className="rounded-4 p-3 d-inline-flex align-items-center justify-content-center" style={{ background: stat.bg, color: stat.color, width: '56px' }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="extra-small fw-black text-muted text-uppercase mb-0">{stat.label}</p>
                                        <div className="d-flex align-items-baseline gap-1">
                                            <span className="h3 fw-black mb-0">{stat.value.toFixed(1)}</span>
                                            <span className="small text-muted fw-bold">{stat.unit}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}

                        <div className="col-12 mt-4">
                            <motion.div 
                                className="bb-insight-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="d-flex align-items-start gap-4 position-relative z-1">
                                    <div className="rounded-circle p-3 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30">
                                        <TrendingUp size={32} />
                                    </div>
                                    <div>
                                        <h3 className="h4 fw-black mb-2">Nutritional Insight 📊</h3>
                                        <p className="mb-0 opacity-90 fw-medium">
                                            {summary?.TotalProtein > 100 
                                                ? "Excellent protein intake! This supports muscle recovery and satiety." 
                                                : "Try to increase your lean protein intake to support your metabolic goals."}
                                        </p>
                                    </div>
                                </div>
                                <Zap size={140} className="position-absolute opacity-10" style={{ right: '-20px', bottom: '-40px' }} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress vs Goal Grid */}
            <div className="row g-4">
                <div className="col-12">
                    <div className="bb-chart-container">
                        <h3 className="h5 fw-black text-dark mb-4">Goal Achievements 🏅</h3>
                        <div className="row g-5">
                            {[
                                { label: "Hydration", current: 75, target: 100, unit: "%", color: "var(--bb-grad-hydration)" },
                                { label: "Activity", current: 85, target: 100, unit: "%", color: "var(--bb-grad-energy)" },
                                { label: "Sleep Quality", current: 60, target: 100, unit: "%", color: "var(--bb-grad-sunlight)" }
                            ].map((goal, i) => (
                                <div key={i} className="col-12 col-md-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-black text-dark">{goal.label}</span>
                                        <span className="fw-bold text-muted">{goal.current} / {goal.target} {goal.unit}</span>
                                    </div>
                                    <div className="bb-progress-bar-container" style={{ height: '14px' }}>
                                        <motion.div 
                                            className="bb-progress-bar-fill"
                                            style={{ background: goal.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.current}%` }}
                                            transition={{ duration: 1.5, delay: 0.8 + i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionSummary;
