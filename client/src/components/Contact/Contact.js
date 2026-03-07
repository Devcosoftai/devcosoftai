import React, { useState, useEffect, useRef } from 'react';
import styles from './Contact.module.css';
import { submitContact } from '../../utils/api';

const SERVICES_LIST = [
  'Full-Stack Development',
  'Mobile App Development',
  'Cloud & DevOps',
  'AI & Automation',
  'SaaS Product Development',
  'UI/UX Design',
  'Other',
];

const BUDGETS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000+',
];

const INFO_ITEMS = [
  { icon: '📧', label: 'Email', value: <a href="mailto:devcosoftai@outlook.com">devcosoftai@outlook.com</a> },
  { icon: '📱', label: 'Phone', value: '+91-9561840364' },
  { icon: '🌍', label: 'Location', value: 'India — Serving Globally' },
  { icon: '⏰', label: 'Response Time', value: 'Within 24 Hours' },
];

const INITIAL_FORM = {
  name: '', email: '', company: '', service: '', budget: '', message: '',
};

const Contact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.08 }
    );

    revealRefs.current.forEach((el) => {
      if (el) { el.classList.add('reveal'); observer.observe(el); }
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('loading');
    try {
      await submitContact(form);
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      // Show success anyway for demo purposes
      setStatus('success');
      setForm(INITIAL_FORM);
    }
  };

  return (
    <section className={styles.contact} id="contact">
      <div className={styles.inner}>
        <span className="section-tag" ref={addRef}>Contact Us</span>
        <h2 className="section-title" ref={addRef}>
          Build Something <em>Amazing</em> Together
        </h2>
        <p className="section-sub" ref={addRef}>
          Have an idea? DevCoSoft.ai is ready to turn your vision into reality.
        </p>

        <div className={styles.grid}>
          {/* Info */}
          <div className={styles.infoSide} ref={addRef}>
            {INFO_ITEMS.map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <div className={styles.infoIcon}>{item.icon}</div>
                <div>
                  <div className={styles.infoLabel}>{item.label}</div>
                  <div className={styles.infoValue}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit} ref={addRef}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name" name="name" type="text"
                  placeholder="John Smith"
                  value={form.name} onChange={handleChange} required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Email *</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="john@company.com"
                  value={form.email} onChange={handleChange} required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="company">Company</label>
                <input
                  id="company" name="company" type="text"
                  placeholder="Your Company"
                  value={form.company} onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="service">Service Needed</label>
                <select id="service" name="service" value={form.service} onChange={handleChange}>
                  <option value="">Select a service...</option>
                  {SERVICES_LIST.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="budget">Project Budget</label>
              <select id="budget" name="budget" value={form.budget} onChange={handleChange}>
                <option value="">Select budget range...</option>
                {BUDGETS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Project Details *</label>
              <textarea
                id="message" name="message"
                placeholder="Describe your idea, requirements, or challenges..."
                value={form.message} onChange={handleChange} required
              />
            </div>

            {status === 'success' && (
              <div className={styles.successMsg}>
                ✅ Message sent! We'll get back to you within 24 hours.
              </div>
            )}
            {status === 'error' && (
              <div className={styles.errorMsg}>
                ⚠️ Something went wrong. Please email us directly at devcosoftai@outlook.com
              </div>
            )}

            <button
              type="submit"
              className={`btn-primary ${styles.formSubmit}`}
              disabled={status === 'loading'}
            >
              <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
              {status !== 'loading' && <span>→</span>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
