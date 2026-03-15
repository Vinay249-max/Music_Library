import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiMusic } from 'react-icons/fi';
import { register } from '../../services/authService';
import { validateRegister, hasErrors } from '../../utils/validation';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegister(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',     type: 'text',     label: 'Full Name',  icon: FiUser,  placeholder: 'Your name' },
    { name: 'email',    type: 'email',    label: 'Email',      icon: FiMail,  placeholder: 'you@example.com' },
    { name: 'phone',    type: 'tel',      label: 'Phone',      icon: FiPhone, placeholder: '9876543210' },
    { name: 'password', type: 'password', label: 'Password',   icon: FiLock,  placeholder: 'Min. 6 characters' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <FiMusic size={32} style={{ color: 'var(--accent-primary)' }} />
          <h1 className="auth-title">JOIN MELODIA</h1>
        </div>
        <p className="auth-subtitle">Create your free account</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {fields.map(({ name, type, label, icon: Icon, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={15} className="form-icon" />
                <input
                  className={`form-input form-input-icon ${errors[name] ? 'error' : ''}`}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  autoComplete={name === 'password' ? 'new-password' : name}
                />
              </div>
              {errors[name] && <span className="form-error">{errors[name]}</span>}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
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
        .auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .auth-title { font-family: var(--font-display); font-size: 30px; letter-spacing: 0.1em; }
        .auth-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 32px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .form-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
        }
        .form-input-icon { padding-left: 38px; }
        .auth-switch { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 24px; }
        .auth-link { color: var(--accent-primary); font-weight: 500; }
        .auth-link:hover { text-decoration: underline; }
        @media (max-width: 480px) { .auth-card { padding: 32px 24px; } }
      `}</style>
    </div>
  );
};

export default RegisterPage;
