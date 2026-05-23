import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import './AuthStyles.css';

/**
 * Bite Balance - Authentication Page (GUI)
 * Maps to the ".aspx" requirement.
 * This component handles both Login and Signup interfaces.
 */
const AuthPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        // Front-end Validations
        if (isRegister && !formData.username) return "Username is required";
        if (!formData.email.includes('@')) return "Invalid email address";
        if (formData.password.length < 6) return "Password must be at least 6 characters";
        if (isRegister && formData.password !== formData.confirmPassword) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setSuccess('Processing...');

        // In a real app, this would call the API handled by AuthController.js
        console.log("Submitting:", isRegister ? "Signup" : "Login", formData);
        
        // Mock success redirect
        setTimeout(() => {
            setSuccess(isRegister ? "Registration Successful! Redirecting to login..." : "Login Successful! Redirecting to profile...");
        }, 1000);
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card-container">
                <div className="auth-form-panel">
                    <div className="text-center mb-4">
                        <h1 className="display-6 fw-bold">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
                        <p className="text-muted">{isRegister ? 'Start your health journey today.' : 'Login to access your dashboard.'}</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="auth-input-group">
                                <label>Username</label>
                                <div className="auth-input-wrapper">
                                    <User className="input-icon" size={20} />
                                    <input 
                                        name="username"
                                        type="text" 
                                        placeholder="Username" 
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="auth-input-group">
                            <label>Email Address</label>
                            <div className="auth-input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input 
                                    name="email"
                                    type="email" 
                                    placeholder="email@example.com" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>Password</label>
                            <div className="auth-input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input 
                                    name="password"
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>

                        {isRegister && (
                            <div className="auth-input-group">
                                <label>Confirm Password</label>
                                <div className="auth-input-wrapper">
                                    <ShieldCheck className="input-icon" size={20} />
                                    <input 
                                        name="confirmPassword"
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="auth-btn">
                            {isRegister ? 'Sign Up' : 'Sign In'} <ChevronRight size={20} />
                        </button>

                        <div className="text-center mt-3">
                            <p>
                                {isRegister ? 'Already have an account?' : 'New user?'} 
                                <button type="button" className="auth-mode-switch" onClick={toggleMode}>
                                    {isRegister ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
