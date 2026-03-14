import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminLogin } from '../../../utils/adminApi';
import styles from './Login.module.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await adminLogin(form);
      login(data.token, data.admin);
      navigate('/admin/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={`${styles.glow} ${styles.glow1}`} />
      <div className={`${styles.glow} ${styles.glow2}`} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoText}>
            DevCo<span className={styles.logoAccent}>Soft</span>.ai
          </div>
          <div className={styles.adminBadge}>Admin Portal</div>
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to access the admin dashboard.</p>

        {apiError && (
          <div className={styles.errorAlert}>⚠ {apiError}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>📧</span>
              <input
                id="email" name="email" type="email"
                placeholder="admin@devcosoft.ai"
                value={form.email} onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password} onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.showPassBtn}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/">← Back to DevCoSoft.ai</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
