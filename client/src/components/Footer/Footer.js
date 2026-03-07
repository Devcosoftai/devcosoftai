import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            DevCo<span className={styles.logoAccent}>Soft</span>.ai
          </Link>
          <p className={styles.brandDesc}>
            Building scalable digital solutions with modern technologies.
            Your end-to-end technology partner for web, mobile, cloud, and AI.
          </p>
          <div className={styles.brandChips}>
            <span className={styles.brandChip}>React.js</span>
            <span className={styles.brandChip}>Node.js</span>
            <span className={styles.brandChip}>MongoDB</span>
            <span className={styles.brandChip}>AWS</span>
            <span className={styles.brandChip}>AI/ML</span>
          </div>
        </div>

        {/* Services */}
        <div>
          <div className={styles.colTitle}>Services</div>
          <ul className={styles.linkList}>
            <li><Link to="/services">Full-Stack Dev</Link></li>
            <li><Link to="/services">Mobile Apps</Link></li>
            <li><Link to="/services">Cloud & DevOps</Link></li>
            <li><Link to="/services">AI & Automation</Link></li>
            <li><Link to="/services">SaaS Products</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <div className={styles.colTitle}>Company</div>
          <ul className={styles.linkList}>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/#process">Our Process</Link></li>
            <li><Link to="/#industries">Industries</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <div className={styles.colTitle}>Connect</div>
          <ul className={styles.linkList}>
            <li><a href="mailto:devcosoftai@outlook.com">devcosoftai@outlook.com</a></li>
            <li><a href="#" target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
            <li><a href="#" target="_blank" rel="noreferrer">GitHub ↗</a></li>
            <li><a href="#" target="_blank" rel="noreferrer">Twitter/X ↗</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <span>© {year} DevCoSoft.ai — All rights reserved.</span>
        <div className={styles.bottomRight}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <span>Built with ❤️ in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
