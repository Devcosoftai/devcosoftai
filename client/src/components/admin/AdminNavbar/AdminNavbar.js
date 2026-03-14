import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import logo from '../../../assets/logo.jpeg';
import styles from './AdminNavbar.module.css';

const AdminNavbar = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.adminNav}>
      <div className={styles.left}>
        <Link to="/admin/dashboard" className={styles.logoWrap}>
          <img src={logo} alt="DevCoSoft.ai" className={styles.logoImg} />
          <span className={styles.logoText}>
            DevCo<span className={styles.logoAccent}>Soft</span>.ai
          </span>
        </Link>
        <div className={styles.divider} />
        <span className={styles.adminLabel}>Admin Portal</span>
        <div className={styles.navLinks}>
          <Link
            to="/admin/dashboard"
            className={`${styles.navLink} ${isActive('/admin/dashboard') ? styles.navLinkActive : ''}`}
          >
            📋 Contacts
          </Link>
          <Link
            to="/admin/settings"
            className={`${styles.navLink} ${isActive('/admin/settings') ? styles.navLinkActive : ''}`}
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>

      <div className={styles.right}>
        <Link to="/" className={styles.viewSiteBtn} target="_blank">
          🌐 View Site
        </Link>
        {admin && (
          <Link to="/admin/settings" className={styles.adminInfo}>
            <span className={styles.adminName}>{admin.name}</span>
            <span className={styles.adminRole}>{admin.role}</span>
          </Link>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
