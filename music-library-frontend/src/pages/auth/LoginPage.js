import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiMusic } from 'react-icons/fi';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { validateLogin, hasErrors } from '../../utils/validation';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form,   setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { loginSuccess } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await login(form);
      loginSuccess(res.data);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      if (from) navigate(from, { replace: true });
      else navigate(role === 'admin' ? '/admin' : '/home', { replace: true });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <FiMusic size={32} style={{ color: 'var(--accent-primary)' }} />
          <h1 className="auth-title">MELODIA</h1>
        </div>
        <p className="auth-subtitle">Sign in to your music universe</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} className="form-icon" />
              <input
                className={`form-input form-input-icon ${errors.email ? 'error' : ''}`}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} className="form-icon" />
              <input
                className={`form-input form-input-icon ${errors.password ? 'error' : ''}`}
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: var(--bg-base);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          background-image: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,255,71,0.07), transparent);
        }
        .auth-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-visible);
          border-radius: var(--radius-xl);
          padding: 48px 40px;
          width: 100%; max-width: 420px;
        }
        .auth-brand {
          display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
        }
        .auth-title {
          font-family: var(--font-display);
          font-size: 36px; letter-spacing: 0.1em;
        }
        .auth-subtitle {
          font-size: 14px; color: var(--text-secondary);
          margin-bottom: 32px;
        }
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .form-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
        }
        .form-input-icon { padding-left: 38px; }
        .auth-switch {
          text-align: center;
          font-size: 13px; color: var(--text-muted);
          margin-top: 24px;
        }
        .auth-link { color: var(--accent-primary); font-weight: 500; }
        .auth-link:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .auth-card { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
