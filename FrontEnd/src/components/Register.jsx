import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Moon, Sun, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
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

  const validateRegisterForm = () => {
    const errors = {};
    if (!registerName.trim()) errors.name = "Name is required";
    else if (registerName.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!registerEmail.trim()) errors.email = "Email is required";
    else if (!validateEmail(registerEmail)) errors.email = "Invalid email format";
    if (!registerPassword) errors.password = "Password is required";
    else if (registerPassword.length < 6) errors.password = "Password must be at least 6 characters";
    if (!registerConfirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (registerPassword !== registerConfirmPassword) errors.confirmPassword = "Passwords do not match";
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const AUTH_BASE = import.meta.env.VITE_API_BASE + "/auth";

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }
    setRegisterLoading(true);
    try {
      const response = await fetch(`${AUTH_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      addToast("Registration successful! You can now login.", "success");
      navigate("/");
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className={`register-wrapper ${darkMode ? "dark-theme" : "light-theme"}`}>
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

      <div className="register-container">
        {/* Left Side - Image & Info */}
        <div className="register-left">
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
            <p className="brand-tagline">Your intelligent note-taking companion</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="feature-text">
                <h3>Organize Everything</h3>
                <p>Keep all your notes in one secure place</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="feature-text">
                <h3>Sync Across Devices</h3>
                <p>Access your notes from anywhere, anytime</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="feature-text">
                <h3>Secure & Private</h3>
                <p>Your data is encrypted and protected</p>
              </div>
            </div>
          </div>

          <div className="testimonial">
            <div className="testimonial-image">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#e0e7ff"/>
                <circle cx="50" cy="40" r="15" fill="#6366f1"/>
                <path d="M 25 75 Q 50 85 75 75" stroke="#6366f1" strokeWidth="8" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="testimonial-content">
              <p>"This app has completely transformed how I organize my work. Absolutely fantastic!"</p>
              <div className="testimonial-author">
                <strong>Prince Soni</strong>
                <span>Software Developer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="register-right">
          <div className="register-card">
            <div className="card-header">
              <h2 className="card-title">Create Account</h2>
              <p className="card-subtitle">Start your journey with us today</p>
            </div>

            <form className="register-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <div className="input-container">
                  <User className="input-icon" size={18} />
                  <input
                    id="name"
                    type="text"
                    className={`form-control ${registerErrors.name ? "error" : ""}`}
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                {registerErrors.name && <span className="error-text">{registerErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-container">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    className={`form-control ${registerErrors.email ? "error" : ""}`}
                    placeholder="john@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                {registerErrors.email && <span className="error-text">{registerErrors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="password"
                      type={showRegisterPassword ? "text" : "password"}
                      className={`form-control ${registerErrors.password ? "error" : ""}`}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={registerLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {registerErrors.password && <span className="error-text">{registerErrors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${registerErrors.confirmPassword ? "error" : ""}`}
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      disabled={registerLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && <span className="error-text">{registerErrors.confirmPassword}</span>}
                </div>
              </div>

              <div className="security-badge">
                <ShieldCheck size={16} />
                <span>Your information is secure and encrypted</span>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={registerLoading}
              >
                {registerLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              <div className="form-footer">
                <span className="footer-text">Already have an account?</span>
                <Link to="/" className="footer-link">Sign In</Link>
              </div>
            </form>
          </div>

          <div className="register-footer">
            <p>By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;