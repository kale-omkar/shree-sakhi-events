import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminEnquiriesApi } from '../api/adminApi';

/**
 * Format ISO datetime string to Indian readable date/time safely
 */
function formatEnquiryDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

/**
 * Resolve badge style class for enquiry category
 */
function getCategoryBadge(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('stall') || t.includes('exhibit')) {
    return { label: type || 'Stall Booking', icon: '🎪', cls: 'badge-enq-stall' };
  }
  if (t.includes('sponsor') || t.includes('partner')) {
    return { label: type || 'Sponsorship', icon: '🤝', cls: 'badge-enq-sponsor' };
  }
  if (t.includes('participat') || t.includes('perform')) {
    return { label: type || 'Participation', icon: '🎭', cls: 'badge-enq-participate' };
  }
  if (t.includes('media') || t.includes('press')) {
    return { label: type || 'Media & Press', icon: '📰', cls: 'badge-enq-media' };
  }
  return { label: type || 'General Enquiry', icon: '💬', cls: 'badge-enq-general' };
}

export default function AdminEnquiriesSection({ showToast, onUnauthorized }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal inspection
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Load enquiries from backend API
  const loadEnquiries = useCallback(() => {
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);

    adminEnquiriesApi.getAll()
      .then((data) => {
        setEnquiries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        const msg = err.message || 'Failed to load enquiries';
        if (msg.toLowerCase().includes('unauthori') || msg.toLowerCase().includes('401') || msg.toLowerCase().includes('403')) {
          setIsUnauthorized(true);
          setError('Unauthorized: Admin session expired or invalid API key.');
          if (onUnauthorized) {
            onUnauthorized();
          }
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onUnauthorized]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // Extract unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    enquiries.forEach((enq) => {
      if (enq.enquiryType && enq.enquiryType.trim()) {
        set.add(enq.enquiryType.trim());
      }
    });
    return Array.from(set);
  }, [enquiries]);

  // Filter enquiries client-side
  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return enquiries.filter((enq) => {
      // Category filter match
      if (selectedCategory !== 'ALL' && enq.enquiryType !== selectedCategory) {
        return false;
      }

      // Search query match
      if (!q) return true;

      const idStr = String(enq.id || '');
      const refCode = `sse-enq-${idStr.padStart(5, '0')}`;
      const name = (enq.fullName || '').toLowerCase();
      const email = (enq.email || '').toLowerCase();
      const phone = (enq.phone || '').toLowerCase();
      const type = (enq.enquiryType || '').toLowerCase();
      const company = (enq.companyName || '').toLowerCase();
      const msg = (enq.message || '').toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        type.includes(q) ||
        company.includes(q) ||
        msg.includes(q) ||
        idStr.includes(q) ||
        refCode.includes(q)
      );
    });
  }, [enquiries, searchQuery, selectedCategory]);

  // Stats calculation
  const totalEnquiries = enquiries.length;
  const stallEnquiries = enquiries.filter((e) =>
    (e.enquiryType || '').toLowerCase().includes('stall') || (e.enquiryType || '').toLowerCase().includes('exhibit')
  ).length;
  const sponsorEnquiries = enquiries.filter((e) =>
    (e.enquiryType || '').toLowerCase().includes('sponsor') || (e.enquiryType || '').toLowerCase().includes('partner')
  ).length;
  const generalEnquiries = enquiries.filter((e) => {
    const t = (e.enquiryType || '').toLowerCase();
    return !t.includes('stall') && !t.includes('exhibit') && !t.includes('sponsor') && !t.includes('partner');
  }).length;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      showToast?.(`Copied ${fieldName} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {});
  };

  return (
    <div className="admin-enquiries-section" id="admin-enquiries-tab">
      {/* ── Stats Bar ── */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <div className="admin-stat">
          <span className="admin-stat__icon">📬</span>
          <span className="admin-stat__val">{totalEnquiries}</span>
          <span className="admin-stat__label">Total Enquiries</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">🎪</span>
          <span className="admin-stat__val" style={{ color: 'var(--color-primary-light)' }}>
            {stallEnquiries}
          </span>
          <span className="admin-stat__label">Stall & Exhibition</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">🤝</span>
          <span className="admin-stat__val" style={{ color: 'var(--color-gold-light)' }}>
            {sponsorEnquiries}
          </span>
          <span className="admin-stat__label">Sponsorships</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">💬</span>
          <span className="admin-stat__val" style={{ color: '#60a5fa' }}>
            {generalEnquiries}
          </span>
          <span className="admin-stat__label">General & Others</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Field */}
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className="admin-search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search by customer name, email, phone, category, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input admin-list__search-input"
              id="admin-enquiries-search"
              aria-label="Search enquiries"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '180px' }}
            id="admin-enquiries-category-filter"
            aria-label="Filter enquiries by category"
          >
            <option value="ALL">All Categories ({totalEnquiries})</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({enquiries.filter((e) => e.enquiryType === cat).length})
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={() => {
            loadEnquiries();
            showToast?.('Refreshed enquiries list');
          }}
          className="btn btn-outline btn-sm"
          id="admin-enquiries-refresh-btn"
          title="Refresh enquiries list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="admin-loading" aria-busy="true">
          <div className="spinner" />
          <p>Loading enquiries from server...</p>
        </div>
      )}

      {/* ── Unauthorized / Expired State ── */}
      {!loading && isUnauthorized && (
        <div className="admin-error" role="alert" style={{ borderColor: 'rgba(239, 68, 68, 0.6)' }}>
          <span style={{ fontSize: '2rem' }}>🔒</span>
          <h3>Admin Authorization Required</h3>
          <p>{error || 'Your admin key is either invalid or session has expired.'}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onUnauthorized?.()}
            id="admin-enquiries-reauth-btn"
          >
            Sign In Again
          </button>
        </div>
      )}

      {/* ── Generic Error State ── */}
      {!loading && !isUnauthorized && error && (
        <div className="admin-error" role="alert">
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={loadEnquiries}
            id="admin-enquiries-retry-btn"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Loaded Content ── */}
      {!loading && !error && !isUnauthorized && (
        <>
          {totalEnquiries === 0 ? (
            /* No enquiries in database */
            <div className="admin-empty">
              <span className="admin-empty__icon" style={{ fontSize: '2.5rem' }}>📭</span>
              <p>No enquiries received yet.</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                New customer inquiries from the public Enquiry portal will appear here in real time.
              </span>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            /* No search or filter matches */
            <div className="admin-empty">
              <span className="admin-empty__icon" style={{ fontSize: '2.5rem' }}>🔍</span>
              <p>No enquiries match your search criteria.</p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            /* Data Table */
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ width: '100%', minWidth: '900px' }} aria-label="Customer Enquiries List">
                <thead>
                  <tr>
                    <th>Ref Code & Date</th>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <th>Enquiry Category</th>
                    <th>Message Details</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enq) => {
                    const badge = getCategoryBadge(enq.enquiryType);
                    const refCode = `SSE-ENQ-${String(enq.id || 0).padStart(5, '0')}`;

                    return (
                      <tr key={enq.id || refCode} className="admin-table__row">
                        {/* Reference & Date */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <strong
                            style={{
                              fontFamily: 'monospace',
                              color: 'var(--color-gold-light)',
                              fontSize: '0.88rem',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {refCode}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {formatEnquiryDateTime(enq.createdAt)}
                          </div>
                        </td>

                        {/* Customer Name & Company */}
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                            {enq.fullName || '—'}
                          </div>
                          {enq.companyName && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              🏢 {enq.companyName}
                            </div>
                          )}
                        </td>

                        {/* Contact details */}
                        <td>
                          <div>
                            <a
                              href={`mailto:${enq.email}`}
                              style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}
                              title="Send email"
                            >
                              {enq.email || '—'}
                            </a>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {enq.phone ? (
                              <a
                                href={`tel:${enq.phone}`}
                                style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                                title="Call phone"
                              >
                                📞 {enq.phone}
                              </a>
                            ) : (
                              '—'
                            )}
                          </div>
                        </td>

                        {/* Category badge */}
                        <td>
                          <span
                            className={`badge ${badge.cls}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            <span aria-hidden="true">{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Message Preview (Safely truncated to prevent layout breaking) */}
                        <td style={{ maxWidth: '300px' }}>
                          <p
                            style={{
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'var(--color-text-muted)',
                              fontSize: '0.88rem',
                            }}
                            title={enq.message}
                          >
                            {enq.message || '—'}
                          </p>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setActiveEnquiry(enq)}
                            id={`view-enquiry-${enq.id}`}
                            title="View full enquiry details"
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Detail Modal View ── */}
      {activeEnquiry && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setActiveEnquiry(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
        >
          <div
            className="admin-modal-card glass"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: 'var(--color-gold-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {`SSE-ENQ-${String(activeEnquiry.id || 0).padStart(5, '0')}`}
                </span>
                <h3 id="enquiry-modal-title" style={{ margin: '0.25rem 0 0', fontSize: '1.35rem' }}>
                  Enquiry Details
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveEnquiry(null)}
                aria-label="Close dialog"
                style={{ fontSize: '1.2rem', padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Info Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Customer Name
                </small>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                  {activeEnquiry.fullName || '—'}
                </div>
              </div>

              <div>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Company / Organization
                </small>
                <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                  {activeEnquiry.companyName || '— (Individual Participant)'}
                </div>
              </div>

              <div>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Email Address
                </small>
                <div>
                  <a
                    href={`mailto:${activeEnquiry.email}`}
                    style={{ color: 'var(--color-primary-light)', wordBreak: 'break-all' }}
                  >
                    {activeEnquiry.email || '—'}
                  </a>
                </div>
              </div>

              <div>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Phone Number
                </small>
                <div>
                  <a
                    href={`tel:${activeEnquiry.phone}`}
                    style={{ color: 'var(--color-text)' }}
                  >
                    {activeEnquiry.phone || '—'}
                  </a>
                </div>
              </div>

              <div>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Enquiry Category
                </small>
                <div style={{ marginTop: '0.25rem' }}>
                  <span
                    className={`badge ${getCategoryBadge(activeEnquiry.enquiryType).cls}`}
                    style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
                  >
                    {getCategoryBadge(activeEnquiry.enquiryType).icon} {activeEnquiry.enquiryType || 'General'}
                  </span>
                </div>
              </div>

              <div>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Received At
                </small>
                <div style={{ color: 'var(--color-text)', fontSize: '0.92rem' }}>
                  {formatEnquiryDateTime(activeEnquiry.createdAt)}
                </div>
              </div>
            </div>

            {/* Message Box — Prevents layout breaks with word-break and pre-wrap */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <small style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  Message Content
                </small>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  onClick={() => handleCopy(activeEnquiry.message, 'message')}
                >
                  {copiedField === 'message' ? '✓ Copied' : 'Copy Message'}
                </button>
              </div>
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.92rem',
                  lineHeight: '1.6',
                  color: 'var(--color-text)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {activeEnquiry.message || 'No message provided.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1.25rem',
              }}
            >
              {activeEnquiry.email && (
                <a
                  href={`mailto:${activeEnquiry.email}?subject=${encodeURIComponent(`Shree Sakhi Events: Regarding your enquiry SSE-ENQ-${String(activeEnquiry.id || 0).padStart(5, '0')}`)}`}
                  className="btn btn-outline btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ✉️ Email Customer
                </a>
              )}

              {activeEnquiry.phone && (
                <a
                  href={`https://wa.me/91${activeEnquiry.phone.replace(/\D/g, '').replace(/^91/, '')}?text=${encodeURIComponent(`Hello ${activeEnquiry.fullName || ''}, this is Shree Sakhi Events team following up on your enquiry regarding ${activeEnquiry.enquiryType || 'our events'}.`)}`}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#22c55e', color: '#22c55e' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 WhatsApp
                </a>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveEnquiry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
