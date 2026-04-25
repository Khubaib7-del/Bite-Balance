import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import BackgroundOrbs from './components/BackgroundOrbs';
import ThreeBackground from './components/ThreeBackground';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FoodSearch from './pages/FoodSearch';
import MealPlanner from './pages/MealPlanner';
import NutritionSummary from './pages/NutritionSummary';
import SavedPlans from './pages/SavedPlans';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Calculators from './pages/Calculators';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import './styles/index.css';
import './styles/theme.css';
import { getStoredUser } from './utils/date';

// Helper components for routing
const ProtectedRoute = ({ token, children, handleLogout }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <UserLayout onLogout={handleLogout}>{children}</UserLayout>;
};

const PublicRoute = ({ token, children }) => {
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AdminRoute = ({ token, children, handleLogout }) => {
  const user = getStoredUser();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <UserLayout onLogout={handleLogout}>{children}</UserLayout>;
};

const App = () => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const isValid = savedToken && savedToken !== 'null' && savedToken !== 'undefined';
    return isValid ? savedToken : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      const isValid = currentToken && currentToken !== 'null' && currentToken !== 'undefined';
      setToken(isValid ? currentToken : null);
    };
    window.addEventListener('storage', handleStorageChange);
    
    if (token) {
        document.body.classList.add('body-auth');
    } else {
        document.body.classList.remove('body-auth');
    }

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.body.classList.remove('body-auth');
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    window.location.reload();
  };

  return (
    <Router>
      <BackgroundOrbs />
      <ThreeBackground />
      <div className="min-vh-100 position-relative">
        <Routes>
          <Route path="/login" element={<PublicRoute token={token}><AuthPage setToken={setToken} /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute token={token}><AuthPage setToken={setToken} /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute token={token}><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute token={token}><ResetPassword /></PublicRoute>} />

          <Route path="/" element={<ProtectedRoute token={token} handleLogout={handleLogout}><Dashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute token={token} handleLogout={handleLogout}><FoodSearch /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute token={token} handleLogout={handleLogout}><MealPlanner /></ProtectedRoute>} />
          <Route path="/saved-plans" element={<ProtectedRoute token={token} handleLogout={handleLogout}><SavedPlans /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute token={token} handleLogout={handleLogout}><NutritionSummary /></ProtectedRoute>} />
          <Route path="/calculators" element={<ProtectedRoute token={token} handleLogout={handleLogout}><Calculators /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute token={token} handleLogout={handleLogout}><Notifications /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute token={token} handleLogout={handleLogout}><AdminDashboard /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute token={token} handleLogout={handleLogout}><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute token={token} handleLogout={handleLogout}><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
