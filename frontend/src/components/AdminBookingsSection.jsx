import { useState, useEffect, useCallback } from 'react';
import { adminBookingApi } from '../api/bookingApi';
import { adminEventsApi } from '../api/adminApi';

export default function AdminBookingsSection({ showToast }) {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected booking for modal detail view
  const [activeBooking, setActiveBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Load events for filter dropdown
  useEffect(() => {
    adminEventsApi.getAll()
      .then(setEvents)
      .catch((err) => console.error('Failed to load events for filter:', err));
  }, []);

  // Load bookings
  const loadBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    adminBookingApi.getAll(selectedEventId, selectedStatus)
      .then((data) => {
        setBookings(data || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch bookings');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedEventId, selectedStatus]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Update status (Confirm / Cancel)
  const handleStatusUpdate = async (id, newStatus) => {
    const confirmPrompt = window.confirm(`Are you sure you want to change booking status to ${newStatus}?`);
    if (!confirmPrompt) return;

    setUpdatingId(id);
    try {
      await adminBookingApi.updateStatus(id, { bookingStatus: newStatus });
      showToast?.(`Booking status updated to ${newStatus}`);
      loadBookings();
      if (activeBooking && activeBooking.id === id) {
        setActiveBooking((prev) => ({ ...prev, bookingStatus: newStatus }));
      }
    } catch (err) {
      showToast?.(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter bookings client-side for search query
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.bookingRef?.toLowerCase().includes(q) ||
      b.fullName?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.includes(q) ||
      b.company?.toLowerCase().includes(q) ||
      b.eventName?.toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === 'PENDING').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  return (
    <div className="admin-bookings-section" id="admin-bookings-tab">
      {/* ── Stats Bar ── */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <div className="admin-stat">
          <span className="admin-stat__icon">🎟️</span>
          <span className="admin-stat__val">{totalCount}</span>
          <span className="admin-stat__label">Total Bookings</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">✅</span>
          <span className="admin-stat__val" style={{ color: '#10B981' }}>{confirmedCount}</span>
          <span className="admin-stat__label">Confirmed</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">⏳</span>
          <span className="admin-stat__val" style={{ color: '#F59E0B' }}>{pendingCount}</span>
          <span className="admin-stat__label">Pending</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">❌</span>
          <span className="admin-stat__val" style={{ color: '#EF4444' }}>{cancelledCount}</span>
          <span className="admin-stat__label">Cancelled</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">💰</span>
          <span className="admin-stat__val" style={{ color: 'var(--color-gold-light)', fontSize: '1.6rem' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <span className="admin-stat__label">Paid Revenue</span>
        </div>
      </div>

      {/* ── Filter Controls ── */}
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
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <input
              type="search"
              placeholder="Search reference, name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              id="admin-bookings-search"
            />
          </div>

          {/* Event Filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '180px' }}
            id="admin-bookings-event-filter"
          >
            <option value="">All Events</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '150px' }}
            id="admin-bookings-status-filter"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          className="btn btn-outline btn-sm"
          id="admin-bookings-refresh-btn"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Loading / Error State ── */}
      {loading && (
        <div className="admin-loading">
          <div className="spinner" />
          <p>Loading bookings...</p>
        </div>
      )}

      {error && !loading && (
        <div className="admin-error">
          <p>⚠️ {error}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={loadBookings}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Bookings Table ── */}
      {!loading && !error && (
        <>
          {filteredBookings.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty__icon">📭</span>
              <p>No bookings found matching the selected filters.</p>
            </div>
          ) : (
            <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', minWidth: '850px' }}>
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Booker & Contact</th>
                    <th>Type</th>
                    <th>Event</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Booking Status</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id || b.bookingRef}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                          {b.bookingRef}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : ''}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{b.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {b.phone} • {b.email}
                        </div>
                        {b.company && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)' }}>
                            🏢 {b.company}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'var(--color-surface-2)',
                          }}
                        >
                          {b.bookerType}
                        </span>
                      </td>

                      <td>
                        <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.eventName || `Event #${b.eventId}`}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {b.quantity || 1}
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        {b.amount != null && Number(b.amount) > 0 ? (
                          `₹${Number(b.amount).toLocaleString('en-IN')}`
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>Free</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${b.bookingStatus}`}
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge pay-${b.paymentStatus}`}
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="View full booking details"
                            onClick={() => setActiveBooking(b)}
                          >
                            👁️
                          </button>

                          {b.bookingStatus !== 'CONFIRMED' && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: '#10B981', color: '#10B981' }}
                              title="Confirm Booking"
                              disabled={updatingId === b.id}
                              onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                            >
                              ✓
                            </button>
                          )}

                          {b.bookingStatus !== 'CANCELLED' && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: '#EF4444', color: '#EF4444' }}
                              title="Cancel Booking"
                              disabled={updatingId === b.id}
                              onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Booking Detail Modal ── */}
      {activeBooking && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setActiveBooking(null)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Booking Details</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveBooking(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Reference</small>
                <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{activeBooking.bookingRef}</div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Event</small>
                <div style={{ fontWeight: 600 }}>{activeBooking.eventName}</div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Full Name</small>
                <div>{activeBooking.fullName}</div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Booker Type</small>
                <div style={{ textTransform: 'capitalize' }}>{activeBooking.bookerType}</div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Phone</small>
                <div>{activeBooking.phone}</div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Email</small>
                <div>{activeBooking.email}</div>
              </div>
              {activeBooking.company && (
                <div>
                  <small style={{ color: 'var(--color-text-muted)' }}>Company</small>
                  <div>{activeBooking.company}</div>
                </div>
              )}
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Quantity</small>
                <div>{activeBooking.quantity}</div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Booking Status</small>
                <div>
                  <span className={`status-badge status-${activeBooking.bookingStatus}`}>
                    {activeBooking.bookingStatus}
                  </span>
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--color-text-muted)' }}>Payment Status</small>
                <div>
                  <span className={`status-badge pay-${activeBooking.paymentStatus}`}>
                    {activeBooking.paymentStatus}
                  </span>
                </div>
              </div>
              {activeBooking.paymentReference && (
                <div style={{ gridColumn: 'span 2' }}>
                  <small style={{ color: 'var(--color-text-muted)' }}>Payment Ref / Txn ID</small>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {activeBooking.paymentReference}
                  </div>
                </div>
              )}
              {activeBooking.message && (
                <div style={{ gridColumn: 'span 2' }}>
                  <small style={{ color: 'var(--color-text-muted)' }}>Special Requests / Message</small>
                  <p style={{ background: 'var(--color-surface-2)', padding: '0.75rem', borderRadius: '6px', margin: '4px 0 0' }}>
                    {activeBooking.message}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {activeBooking.bookingStatus !== 'CONFIRMED' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStatusUpdate(activeBooking.id, 'CONFIRMED')}
                >
                  ✓ Confirm Booking
                </button>
              )}
              {activeBooking.bookingStatus !== 'CANCELLED' && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#EF4444', color: '#EF4444' }}
                  onClick={() => handleStatusUpdate(activeBooking.id, 'CANCELLED')}
                >
                  ✕ Cancel Booking
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveBooking(null)}
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
