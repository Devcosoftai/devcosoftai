import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import { adminGetContact, adminUpdateStatus, adminDeleteContact } from '../../../utils/adminApi';
import styles from './ContactDetail.module.css';

const STATUS_OPTIONS = ['new', 'read', 'replied', 'archived'];

const StatusBadge = ({ status }) => {
  const icons = { new: '🔵', read: '🟡', replied: '🟢', archived: '⚫' };
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};

const MetaItem = ({ label, value }) => (
  <div className={styles.metaItem}>
    <div className={styles.metaKey}>{label}</div>
    <div className={`${styles.metaVal} ${!value ? styles.empty : ''}`}>
      {value || 'Not specified'}
    </div>
  </div>
);

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Fetch contact on mount
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await adminGetContact(id);
        setContact(data.data);

        // Auto-mark as read if it's new
        if (data.data.status === 'new') {
          await adminUpdateStatus(id, 'read');
          setContact((prev) => ({ ...prev, status: 'read' }));
        }
      } catch (err) {
        setError('Failed to load contact details.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await adminUpdateStatus(id, newStatus);
      setContact((prev) => ({ ...prev, status: newStatus }));
      showToast(`✅ Status updated to "${newStatus}"`);
    } catch {
      showToast('❌ Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this contact request? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await adminDeleteContact(id);
      navigate('/admin/dashboard', { state: { toast: '🗑️ Contact deleted' } });
    } catch {
      showToast('❌ Failed to delete contact');
      setDeleting(false);
    }
  };

  const handleEmailReply = () => {
    if (!contact) return;
    const subject = encodeURIComponent(`Re: Your enquiry at DevCoSoft.ai`);
    const body = encodeURIComponent(
      `Hi ${contact.name},\n\nThank you for reaching out to DevCoSoft.ai!\n\nRegarding your enquiry about ${contact.service || 'our services'}:\n\n[Your reply here]\n\nBest regards,\nDevCoSoft.ai Team\ninfo@devcosoft.ai`
    );
    window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <AdminNavbar />
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.inner}>

        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate('/admin/dashboard')}>
          ← Back to All Requests
        </button>

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner}>⟳</span>
            Loading contact details...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className={styles.errorState}>
            ⚠ {error}
          </div>
        )}

        {/* Content */}
        {contact && !loading && (
          <>
            {/* Header Card */}
            <div className={styles.headerCard}>
              <div className={styles.headerTop}>

                <div className={styles.clientInfo}>
                  <h1 className={styles.clientName}>{contact.name}</h1>
                  <div className={styles.clientEmail}>
                    <a href={`mailto:${contact.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      📧 {contact.email}
                    </a>
                  </div>
                  {contact.company && (
                    <div className={styles.clientCompany}>
                      🏢 {contact.company}
                    </div>
                  )}
                </div>

                <div className={styles.headerRight}>
                  <div className={styles.submittedDate}>
                    📅 {formatDate(contact.createdAt)}<br />
                    <span style={{ color: '#7a99bb', fontSize: '0.8rem' }}>
                      at {formatTime(contact.createdAt)} IST
                    </span>
                  </div>

                  <StatusBadge status={contact.status} />

                  <div className={styles.statusControl}>
                    <span className={styles.statusLabel}>Change Status:</span>
                    <select
                      className={styles.statusSelect}
                      value={contact.status}
                      onChange={handleStatusChange}
                      disabled={updating}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Meta Info */}
              <div className={styles.metaRow}>
                <MetaItem label="Service Requested" value={contact.service} />
                <MetaItem label="Project Budget" value={contact.budget} />
                <MetaItem label="IP Address" value={contact.ipAddress} />
              </div>
            </div>

            {/* Message Card */}
            <div className={styles.messageCard}>
              <div className={styles.cardTitle}>
                💬 Project Details / Message
              </div>
              <div className={styles.messageText}>
                {contact.message}
              </div>
            </div>

            {/* Actions Card */}
            {/* <div className={styles.actionsCard}>
              <div className={styles.actionsLeft}>
                <button className={styles.btnPrimary} onClick={handleEmailReply}>
                  ✉️ Reply via Email
                </button>
                <a
                  className={styles.btnSecondary}
                  href={`mailto:${contact.email}`}
                >
                  📧 Open Email Client
                </a>
              </div>

              <button
                className={styles.btnDanger}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '⏳ Deleting...' : '🗑️ Delete Request'}
              </button>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactDetail;
