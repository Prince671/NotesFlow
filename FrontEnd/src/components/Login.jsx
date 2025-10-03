import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Moon, Sun, CheckCircle2, Shield, Zap, Users } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateLoginForm = () => {
    const errors = {};
    if (!loginEmail.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(loginEmail)) {
      errors.email = "Invalid email format";
    }
    if (!loginPassword) {
      errors.password = "Password is required";
    } else if (loginPassword.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      addToast("Login successful! Welcome back!", "success");

      navigate("/notes");
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className={`login-wrapper ${darkMode ? "dark-theme" : "light-theme"}`}>
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Close">×</button>
          </div>
        ))}
      </div>

      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-logo">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="30" width="60" height="50" rx="8" fill="white" opacity="0.9"/>
                <line x1="30" y1="45" x2="70" y2="45" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                <line x1="30" y1="55" x2="60" y2="55" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                <line x1="30" y1="65" x2="65" y2="65" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="brand-title">Notes</h1>
            <p className="brand-tagline">Capture ideas, organize thoughts, achieve more</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">1M+</div>
                <div className="stat-label">Notes Created</div>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-badge">
              <CheckCircle2 size={18} />
              <span>Encrypted & Secure</span>
            </div>
            <div className="feature-badge">
              <CheckCircle2 size={18} />
              <span>Cloud Sync</span>
            </div>
            <div className="feature-badge">
              <CheckCircle2 size={18} />
              <span>Multi-Device</span>
            </div>
            <div className="feature-badge">
              <CheckCircle2 size={18} />
              <span>24/7 Support</span>
            </div>
          </div>

          <div className="quote-section">
            <svg className="quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 21C3 17.134 6.134 14 10 14C10 17.866 6.866 21 3 21ZM14 21C14 17.134 17.134 14 21 14C21 17.866 17.866 21 14 21Z" fill="white" opacity="0.3"/>
            </svg>
            <p className="quote-text">"The best note-taking app I've ever used. Simple, powerful, and beautiful."</p>
            <div className="quote-author">
              <div className="author-avatar">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#dbeafe"/>
                  <circle cx="50" cy="40" r="15" fill="#3b82f6"/>
                  <path d="M 25 75 Q 50 85 75 75" stroke="#3b82f6" strokeWidth="8" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="author-name">Prince Soni</div>
                <div className="author-title">Software Engineer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-card">
            <div className="card-header">
              <h2 className="card-title">Welcome Back</h2>
              <p className="card-subtitle">Sign in to access your notes</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-container">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    className={`form-control ${loginErrors.email ? "error" : ""}`}
                    placeholder="john@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>
                {loginErrors.email && <span className="error-text">{loginErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="input-container">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="password"
                    type={showLoginPassword ? "text" : "password"}
                    className={`form-control ${loginErrors.password ? "error" : ""}`}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && <span className="error-text">{loginErrors.password}</span>}
              </div>

              <div className="form-actions">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => addToast("Password reset feature coming soon!", "info")}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="form-footer">
                <span className="footer-text">Don't have an account?</span>
                <Link to="/register" className="footer-link">Create Account</Link>
              </div>
            </form>
          </div>

          <div className="login-footer">
            <div className="security-note">
              <Shield size={16} />
              <span>Your connection is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;