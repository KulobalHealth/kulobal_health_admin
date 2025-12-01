import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../utils/authService';
import loginImage from '../../assets/images/login.png';
import logoImage from '../../assets/images/logo.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the authentication API
      const credentials = {
        email: formData.email,
        password: formData.password,
      };
      
      await login(credentials);
      
      // Show success toast
      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {/* Left Panel - Login Form */}
      <div className="login-left-panel">
        <div className="login-content">
          {/* Logo */}
          <div className="login-logo">
            <img src={logoImage} alt="KuloballHealth Logo" className="login-logo-image" />
          </div>

          {/* Welcome Text */}
          <div className="login-header">
            <h1 className="welcome-title">Welcome, admin</h1>
            <p className="welcome-subtitle">Please enter your credentials below</p>
          </div>

          {/* Error Message */}
          {error && <div className="login-error">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword ? (
                      <>
                        <path
                          d="M2.5 2.5L17.5 17.5M8.75 8.75C8.33579 9.16421 8.125 9.70711 8.125 10.25C8.125 11.2165 8.90853 12 9.875 12C10.4179 12 10.9608 11.7892 11.375 11.375M5.20833 5.20833C3.75 6.45833 2.5 8.33333 1.25 10.25C2.5 12.1667 3.75 14.0417 5.20833 15.2917C6.66667 16.5417 8.33333 17.5 10 17.5C11.6667 17.5 13.3333 16.5417 14.7917 15.2917L11.375 11.375M5.20833 5.20833L8.625 8.625M11.375 11.375L14.7917 14.7917M8.625 8.625C7.91667 7.91667 6.875 7.5 5.83333 7.5C4.16667 7.5 2.5 8.95833 2.5 10.25C2.5 11.5417 4.16667 13 5.83333 13C6.875 13 7.91667 12.5833 8.625 11.875M8.625 8.625L11.375 11.375"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M1.25 10.25C2.5 8.33333 3.75 6.45833 5.20833 5.20833C6.66667 3.95833 8.33333 3 10 3C11.6667 3 13.3333 3.95833 14.7917 5.20833C16.25 6.45833 17.5 8.33333 18.75 10.25C17.5 12.1667 16.25 14.0417 14.7917 15.2917C13.3333 16.5417 11.6667 17.5 10 17.5C8.33333 17.5 6.66667 16.5417 5.20833 15.2917C3.75 14.0417 2.5 12.1667 1.25 10.25Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 13C11.3807 13 12.5 11.8807 12.5 10.5C12.5 9.11929 11.3807 8 10 8C8.61929 8 7.5 9.11929 7.5 10.5C7.5 11.8807 8.61929 13 10 13Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Copyright */}
          <div className="login-copyright">
            Copyright © 2025 Data Leap Technologies LLC
          </div>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div className="login-right-panel" style={{ backgroundImage: `url(${loginImage})` }}>
        <div className="background-overlay">
          {/* Holographic UI Elements */}
          <div className="holographic-elements">
            <div className="holographic-icon icon-1">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 5L25 15L35 17L27 25L28 35L20 30L12 35L13 25L5 17L15 15L20 5Z" fill="rgba(59, 130, 246, 0.6)" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2"/>
              </svg>
            </div>
            <div className="holographic-icon icon-2">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                <circle cx="25" cy="25" r="20" fill="rgba(0, 161, 112, 0.4)" stroke="rgba(0, 161, 112, 0.6)" strokeWidth="2"/>
                <path d="M25 15L25 25L35 25" stroke="rgba(0, 161, 112, 0.8)" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="holographic-icon icon-3">
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                <rect x="10" y="10" width="25" height="25" fill="rgba(59, 130, 246, 0.3)" stroke="rgba(59, 130, 246, 0.7)" strokeWidth="2"/>
                <path d="M15 22.5L20 27.5L30 17.5" stroke="rgba(59, 130, 246, 0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;