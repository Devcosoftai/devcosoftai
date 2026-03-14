import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import {
  adminGetContacts,
  adminUpdateStatus,
  adminDeleteContact,
  adminExportCSV,
} from '../../../utils/adminApi';
import styles from './Dashboard.module.css';

const STATUS_OPTIONS = ['', 'new', 'read', 'replied', 'archived'];
const SERVICE_OPTIONS = [
  '', 'Full-Stack Development', 'Mobile App Development',
  'Cloud & DevOps', 'AI & Automation', 'SaaS Product Development',
  'UI/UX Design', 'Other',
];

const StatusBadge = ({ status }) => {
  const icons = { new: '🔵', read: '🟡', replied: '🟢', archived: '⚫' };
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};

const StatCard = ({ icon, num, label, type }) => (
  <div className={`${styles.statCard} ${styles[type]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <span className={styles.statNum}>{num}</span>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  // Data state
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [page, setPage] = useState(1);

  // UI state
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminGetContacts({
        page,
        limit: 10,
        status: statusFilter || undefined,
        service: serviceFilter || undefined,
        search: search || undefined,
      });
      setContacts(data.data);
      setPagination(data.pagination);
      setStats(data.stats || {});
    } catch (err) {
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, serviceFilter, search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  // Update status
  const handleStatusChange = async (e, id) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    setUpdatingId(id);
    try {
      await adminUpdateStatus(id, newStatus);
      setContacts((prev) =>
        prev.map((c) => c._id === id ? { ...c, status: newStatus } : c)
      );
      showToast(`✅ Status updated to "${newStatus}"`);
    } catch {
      showToast('❌ Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete contact
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this contact request? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await adminDeleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      showToast('🗑️ Contact deleted');
    } catch {
      showToast('❌ Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  // Export CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await adminExportCSV();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `devcosoft-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('📥 CSV exported successfully');
    } catch {
      showToast('❌ Export failed');
    } finally {
      setExporting(false);
    }
  };

  const totalNew = stats.new || 0;
  const totalReplied = stats.replied || 0;
  const totalArchived = stats.archived || 0;
  const totalAll = pagination.total;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const pageNumbers = Array.from({ length: pagination.pages }, (_, i) => i + 1);

  return (
    <div className={styles.dashboard}>
      <AdminNavbar />

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.inner}>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Contact <em>Requests</em></h1>
            <p className={styles.pageSubtitle}>
              Manage all client enquiries submitted through the contact form.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnSecondary}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
            </button>
            <button className={styles.btnPrimary} onClick={fetchContacts}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard icon="📋" num={totalAll} label="Total Requests" type="total" />
          <StatCard icon="🔵" num={totalNew} label="New / Unread" type="new" />
          <StatCard icon="🟢" num={totalReplied} label="Replied" type="replied" />
          <StatCard icon="⚫" num={totalArchived} label="Archived" type="archived" />
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by name, email, company, message..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={serviceFilter}
            onChange={handleFilterChange(setServiceFilter)}
          >
            <option value="">All Services</option>
            {SERVICE_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>⚠ {error}</div>
        )}

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loading}>
              <span className={styles.spinner}>⟳</span>
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <div className={styles.emptyText}>No contact requests found.</div>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Budget</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, idx) => (
                  <tr
                    key={contact._id}
                    onClick={() => navigate(`/admin/contacts/${contact._id}`)}
                  >
                    <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {(page - 1) * 10 + idx + 1}
                    </td>

                    <td>
                      <div className={styles.tdName}>{contact.name}</div>
                      <div className={styles.tdEmail}>{contact.email}</div>
                      {contact.company && (
                        <div className={styles.tdCompany}>🏢 {contact.company}</div>
                      )}
                    </td>

                    <td className={styles.tdService}>
                      {contact.service || <span style={{ color: '#3a5a6a' }}>—</span>}
                    </td>

                    <td className={styles.tdBudget}>
                      {contact.budget || <span style={{ color: '#3a5a6a' }}>—</span>}
                    </td>

                    <td className={styles.tdMessage}>
                      {contact.message}
                    </td>

                    <td className={styles.tdDate}>{formatDate(contact.createdAt)}</td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={styles.statusSelect}
                        value={contact.status}
                        onChange={(e) => handleStatusChange(e, contact._id)}
                        disabled={updatingId === contact._id}
                      >
                        {STATUS_OPTIONS.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.btnIcon} ${styles.btnView}`}
                          title="View Details"
                          onClick={() => navigate(`/admin/contacts/${contact._id}`)}
                        >
                          👁
                        </button>
                        <button
                          className={`${styles.btnIcon} ${styles.btnDelete}`}
                          title="Delete"
                          onClick={(e) => handleDelete(e, contact._id)}
                          disabled={deletingId === contact._id}
                        >
                          {deletingId === contact._id ? '⏳' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && contacts.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalAll)} of {totalAll} results
              </div>
              <div className={styles.paginationBtns}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ←
                </button>
                {pageNumbers.slice(
                  Math.max(0, page - 3),
                  Math.min(pagination.pages, page + 2)
                ).map((n) => (
                  <button
                    key={n}
                    className={`${styles.pageBtn} ${n === page ? styles.active : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
