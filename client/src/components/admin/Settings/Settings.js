import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminChangePassword } from '../../../utils/adminApi';
import styles from './Settings.module.css';

// ── Password strength checker ────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', key: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', key: 'weak' };
  if (score <= 2) return { level: 2, label: 'Medium', key: 'medium' };
  return { level: 3, label: 'Strong', key: 'strong' };
};

const PasswordStrength = ({ password }) => {
  const { level, label, key } = getStrength(password);
  if (!password) return null;
  return (
    <div>
      <div className={styles.strengthBar}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${styles.strengthSegment} ${i <= level ? styles[key] : ''}`}
          />
        ))}
      </div>
      <div className={`${styles.strengthText} ${styles[key]}`}>{label} password</div>
    </div>
  );
};

// ── Main Settings Component ──────────────────────────────────────────────
const Settings = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Change password form
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwStatus, setPwStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [pwMessage, setPwMessage] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePwChange = (e) => {
    setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPwErrors((p) => ({ ...p, [e.target.name]: '' }));
    setPwStatus(null);
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required.';
    if (!pwForm.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (pwForm.newPassword.length < 6) {
      errs.newPassword = 'Must be at least 6 characters.';
    } else if (pwForm.newPassword === pwForm.currentPassword) {
      errs.newPassword = 'New password must be different from current.';
    }
    if (!pwForm.confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (pwForm.newPassword !== pwForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    return errs;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwStatus('loading');
    try {
      await adminChangePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwStatus('success');
      setPwMessage('✅ Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwStatus('error');
      setPwMessage(err.response?.data?.error || '❌ Failed to change password.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'First login';

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className={styles.pageTitle}>Account <em>Settings</em></h1>
          <p className={styles.pageSubtitle}>
            Manage your admin profile and security credentials.
          </p>
        </div>

        {/* ── Profile Info Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>👤</div>
            <div>
              <div className={styles.cardTitle}>Admin Profile</div>
              <div className={styles.cardSubtitle}>Your account information stored in MongoDB</div>
            </div>
          </div>

          <div className={styles.profileGrid}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Full Name</div>
              <div className={styles.infoValue}>{admin?.name}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Email Address</div>
              <div className={styles.infoValue}>{admin?.email}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Role</div>
              <div className={styles.infoValue}>
                <span className={styles.roleBadge}>
                  {admin?.role === 'superadmin' ? '⭐' : '🔑'} {admin?.role}
                </span>
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Password</div>
              <div className={styles.infoValue}>•••••••••• (hashed with bcrypt)</div>
            </div>
          </div>

          <div className={styles.lastLogin}>
            🕐 Last login: {formatDate(admin?.lastLogin)}
          </div>
        </div>

        {/* ── How Auth Works Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🔐</div>
            <div>
              <div className={styles.cardTitle}>Authentication Flow</div>
              <div className={styles.cardSubtitle}>How your credentials are secured</div>
            </div>
          </div>

          {[
            ['📦 Storage', 'Your credentials are stored in MongoDB Atlas. Password is hashed using bcrypt (salt rounds: 12) — never stored as plain text.'],
            ['🔑 Login', 'On login, bcrypt compares your password against the hash. A signed JWT token (24h expiry) is issued and stored in browser localStorage.'],
            ['🛡️ Route Protection', 'Every admin API request sends the JWT in the Authorization header. The server verifies the token signature and checks the admin still exists in the database.'],
            ['♻️ Auto Logout', 'If the token expires or is invalid, you are automatically redirected to the login page. Logging out clears the token from localStorage.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.3rem', color: '#00dcff' }}>
                {title}
              </div>
              <div style={{ color: '#7a99bb', fontSize: '0.88rem', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* ── Change Password Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🔒</div>
            <div>
              <div className={styles.cardTitle}>Change Password</div>
              <div className={styles.cardSubtitle}>Update your login password securely</div>
            </div>
          </div>

          {pwStatus === 'success' && (
            <div className={styles.successAlert}>{pwMessage}</div>
          )}
          {pwStatus === 'error' && (
            <div className={styles.errorAlert}>{pwMessage}</div>
          )}

          <form className={styles.form} onSubmit={handlePwSubmit} noValidate>

            {/* Current Password */}
            <div className={styles.field}>
              <label>Current Password *</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔑</span>
                <input
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  className={pwErrors.currentPassword ? styles.error : ''}
                />
                <button type="button" className={styles.showPassBtn}
                  onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? '🙈' : '👁'}
                </button>
              </div>
              {pwErrors.currentPassword && (
                <span className={styles.fieldError}>⚠ {pwErrors.currentPassword}</span>
              )}
            </div>

            <div className={styles.divider} />

            {/* New Password */}
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>New Password *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    className={pwErrors.newPassword ? styles.error : pwForm.newPassword ? styles.success : ''}
                  />
                  <button type="button" className={styles.showPassBtn}
                    onClick={() => setShowNew(!showNew)}>
                    {showNew ? '🙈' : '👁'}
                  </button>
                </div>
                <PasswordStrength password={pwForm.newPassword} />
                {pwErrors.newPassword && (
                  <span className={styles.fieldError}>⚠ {pwErrors.newPassword}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.field}>
                <label>Confirm New Password *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>✅</span>
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    className={
                      pwErrors.confirmPassword ? styles.error
                      : pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword
                      ? styles.success : ''
                    }
                  />
                  <button type="button" className={styles.showPassBtn}
                    onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword && (
                  <div style={{ color: '#00ffa3', fontSize: '0.75rem', marginTop: '3px' }}>
                    ✓ Passwords match
                  </div>
                )}
                {pwErrors.confirmPassword && (
                  <span className={styles.fieldError}>⚠ {pwErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Password Tips */}
            <div style={{
              background: 'rgba(0,220,255,0.05)', border: '1px solid rgba(0,220,255,0.1)',
              borderRadius: '8px', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#00dcff', fontWeight: 600, marginBottom: '0.5rem' }}>
                💡 Strong Password Tips
              </div>
              {['At least 8 characters long', 'Include uppercase & lowercase letters',
                'Add numbers and special characters (@, #, $, !)',
                'Avoid using your name or email'].map((tip) => (
                <div key={tip} style={{ fontSize: '0.8rem', color: '#7a99bb', marginBottom: '0.2rem' }}>
                  → {tip}
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={pwStatus === 'loading'}
              >
                {pwStatus === 'loading' ? '⏳ Updating...' : '🔒 Update Password'}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPwErrors({});
                  setPwStatus(null);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ── Danger Zone ── */}
        <div className={styles.dangerCard}>
          <div className={styles.dangerTitle}>⚠️ Session Management</div>
          <div className={styles.dangerDesc}>
            Logging out will clear your JWT token from this browser. You will need to sign in again.
            If you suspect unauthorized access, change your password immediately and contact the system administrator.
          </div>
          <button
            style={{ marginTop: '1.25rem' }}
            className={styles.btnPrimary}
            onClick={handleLogout}
            type="button"
          >
            🚪 Logout Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
