import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>

        {/* Logo */}
        <Link to="/" className={styles.logoWrap} onClick={closeMenu}>
          <img src={logo} alt="DevCoSoft.ai" className={styles.logoImg} />
          <span className={styles.logoText}>
            DevCo<span className={styles.logoAccent}>Soft</span>.ai
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.navLinks}>
          {NAV_ITEMS.map(({ label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) => isActive ? styles.active : ''}
                end={path === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link to="/contact" className={styles.navCta}>
          Get Started →
        </Link>

        {/* Mobile Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <button className={styles.mobileClose} onClick={closeMenu} aria-label="Close menu">
          ✕
        </button>

        {/* Mobile Logo */}
        <div className={styles.mobileLogo}>
          <img src={logo} alt="DevCoSoft.ai" className={styles.mobileLogoImg} />
          <span className={styles.mobileLogoText}>
            DevCo<span className={styles.logoAccent}>Soft</span>.ai
          </span>
        </div>

        {NAV_ITEMS.map(({ label, path }) => (
          <Link key={path} to={path} onClick={closeMenu}>
            {label}
          </Link>
        ))}
        <Link to="/contact" className="btn-primary" onClick={closeMenu}>
          Get Free Consultation
        </Link>
      </div>
    </>
  );
};

export default Navbar;
