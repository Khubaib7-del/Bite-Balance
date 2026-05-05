import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Shield, Cpu, HardDrive } from 'lucide-react';
import { adminService } from '../services/api';
import '../styles/Admin.css';

const SystemStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await adminService.getSystemStatus();
                setStatus(res.data);
            } catch (err) {
                console.error('System status load failed', err);
                setStatus({ api: { status: 'Degraded' }, database: { status: 'Unavailable' }, metrics: {} });
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const stats = useMemo(() => {
        const apiStatus = status?.api?.status || 'Unknown';
        const dbStatus = status?.database?.status || 'Unknown';

        return [
            { label: 'API Server', status: apiStatus, color: apiStatus === 'Operational' ? 'text-success' : 'text-danger', icon: <Server size={24} />, load: `${status?.metrics?.mealPlans ?? 0} plans` },
            { label: 'SQL Database', status: dbStatus, color: dbStatus === 'Connected' ? 'text-success' : 'text-danger', icon: <Database size={24} />, load: `${status?.metrics?.users ?? 0} users` },
            { label: 'Authentication Service', status: 'Operational', color: 'text-success', icon: <Shield size={24} />, load: `${status?.metrics?.savedPlans ?? 0} saved` },
            { label: 'Food Catalog', status: 'Operational', color: 'text-success', icon: <HardDrive size={24} />, load: `${status?.metrics?.foods ?? 0} items` }
        ];
    }, [status]);

    return (
        <div className="admin-container">
            <h1 className="h3 fw-black mb-1">System Health & Performance</h1>
            <p className="text-muted small mb-4">Infrastructure monitoring and service status overview.</p>

            <div className="row g-4 mb-5">
                {loading ? (
                    <div className="text-center py-5 text-muted">Loading system status...</div>
                ) : stats.map((stat, idx) => (
                    <div key={idx} className="col-12 col-md-6 col-xl-3">
                        <motion.div 
                            className="bb-chart-card h-100 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className={`mb-3 mx-auto rounded-circle bg-light d-flex align-items-center justify-content-center`} style={{ width: 60, height: 60 }}>
                                {stat.icon}
                            </div>
                            <h6 className="fw-black mb-1">{stat.label}</h6>
                            <p className={`small fw-bold ${stat.color} mb-3`}>● {stat.status}</p>
                            <div className="extra-small text-muted mb-1 text-uppercase fw-black">Current Load</div>
                            <h4 className="fw-black mb-0">{stat.load}</h4>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-12 col-xl-8">
                    <div className="bb-chart-card">
                        <h5 className="fw-black mb-4">Performance Metrics</h5>
                        <div className="p-5 text-center bg-light rounded-4 border-dashed">
                            <Cpu size={48} className="text-muted mb-3 opacity-20" />
                            <p className="text-muted fw-bold">Live performance telemetry is being initialized...</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-4">
                    <div className="bb-chart-card">
                        <h5 className="fw-black mb-4">Recent Updates</h5>
                        <div className="small border-start ps-3 py-2 mb-3">
                            <p className="fw-bold mb-0">User Base Snapshot</p>
                            <p className="text-muted mb-0">Total users: {status?.metrics?.users ?? 0}</p>
                            <span className="extra-small text-muted">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="small border-start ps-3 py-2 mb-3">
                            <p className="fw-bold mb-0">Planning Activity</p>
                            <p className="text-muted mb-0">Meal plans stored: {status?.metrics?.mealPlans ?? 0}</p>
                            <span className="extra-small text-muted">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="small border-start ps-3 py-2 mb-3">
                            <p className="fw-bold mb-0">Nutrition Catalog</p>
                            <p className="text-muted mb-0">Food items tracked: {status?.metrics?.foods ?? 0}</p>
                            <span className="extra-small text-muted">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
