import React, { useEffect, useRef } from 'react';
import styles from './About.module.css';
import { WHY_CHOOSE } from '../../utils/data';

const TECH_CHIPS = [
  'MongoDB', 'Express.js', 'React.js', 'Node.js',
  'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'AI/ML',
];

const About = () => {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );

    revealRefs.current.forEach((el) => {
      if (el) {
        el.classList.add('reveal');
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <section className={styles.about} id="about">
      <div className={styles.inner}>
        <span className="section-tag" ref={addRef}>About Us</span>
        <h2 className="section-title" ref={addRef}>
          We Build <em>Future-Ready</em><br />Digital Products
        </h2>

        <div className={styles.grid}>
          {/* Text */}
          <div className={styles.textSide} ref={addRef}>
            <p>
              DevCoSoft.ai is a modern technology startup focused on delivering
              scalable, secure, and intelligent software solutions. We combine
              full-stack development, cloud computing, and AI innovation to build
              future-ready digital products.
            </p>
            <p>
              Our mission is to empower startups, SMEs, and enterprises with
              reliable technology solutions that drive growth and efficiency.
              From idea to deployment — we are your end-to-end tech partner.
            </p>
            <div className={styles.chips}>
              {TECH_CHIPS.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
 
          {/* Card */}
          <div ref={addRef}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>✦ Why Choose DevCoSoft.ai?</div>
              <ul className={styles.featureList}>
                {WHY_CHOOSE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
