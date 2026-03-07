import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './CtaBanner.module.css';

const CtaBanner = () => {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((el, i) => {
      if (el) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 0.1}s`;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <section className={styles.ctaBanner}>
      <div className={styles.inner}>
        <span className="section-tag" ref={addRef}>Ready to Build?</span>
        <h2 className={styles.title} ref={addRef}>
          Let's Turn Your Vision Into <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>Reality</em>
        </h2>
        <p className={styles.sub} ref={addRef}>
          Have an idea? Need a development partner? DevCoSoft.ai is ready
          to build your next big thing — from MVP to enterprise scale.
        </p>
        <div className={styles.buttons} ref={addRef}>
          <Link to="/contact" className="btn-primary">
            <span>Schedule Free Consultation</span>
            <span>→</span>
          </Link>
          <a href="mailto:devcosoftai@outlook.com" className="btn-outline">
            devcosoftai@outlook.com
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
