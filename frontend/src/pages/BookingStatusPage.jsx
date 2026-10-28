import { useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { COMPANY_INFO } from '../constants/companyInfo';
import './BookingStatusPage.css';
import './BookingConfirmPage.css';

export default function BookingStatusPage() {
  const [ref, setRef] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBooking(null);

    const cleanRef = ref.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanRef) {
      setError('Please enter your Booking Reference (e.g. SSE-2026-0001).');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address matching your booking.');
      return;
    }

    setLoading(true);
    try {
      const data = await bookingApi.getStatus(cleanRef, cleanEmail);
      setBooking(data);
    } catch (err) {
      setError(err.message || 'No booking matched that reference and email combination.');
    } finally {
      setLoading(false);
    }
  };

  const primaryWhatsApp = COMPANY_INFO?.whatsappNumbers?.[0] || '7219310525';

  return (
    <main className="status-lookup-page" id="booking-status-page">
      <div className="status-lookup-card">
        <div className="status-lookup-header">
          <span className="status-lookup-icon" aria-hidden="true">🔍</span>
          <h1 className="status-lookup-title">Check Booking Status</h1>
          <p className="status-lookup-sub">
            Enter your booking reference code and the email address used during booking.
          </p>
        </div>

        {error && (
          <div className="status-alert status-alert--error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="status-lookup-form" noValidate>
          <div className="form-group">
            <label htmlFor="lookup-ref" className="form-label">
              Booking Reference <span className="req">*</span>
            </label>
            <input
              id="lookup-ref"
              type="text"
              className="form-input"
              placeholder="e.g. SSE-2026-0001"
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              required
            />
            <span className="form-hint">Found in your booking confirmation screen or email</span>
          </div>

          <div className="form-group">
            <label htmlFor="lookup-email" className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              id="lookup-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
            id="lookup-submit-btn"
          >
            {loading ? 'Searching...' : '🔍 Check Status'}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {booking && (
        <div className="status-result-wrap" id="status-result">
          <div className="status-result-card">
            <div className="status-result-header">
              <div>
                <span className="confirm-detail__label">Booking Reference</span>
                <div className="status-result-ref">{booking.bookingRef}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`status-badge status-${booking.bookingStatus}`}>
                  {booking.bookingStatus}
                </span>
                <span className={`status-badge pay-${booking.paymentStatus}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="confirm-details-grid">
              <div className="confirm-detail">
                <div className="confirm-detail__label">Event</div>
                <div className="confirm-detail__value">{booking.eventName || 'Shree Sakhi Event'}</div>
              </div>

              <div className="confirm-detail">
                <div className="confirm-detail__label">Booker Name</div>
                <div className="confirm-detail__value">{booking.fullName}</div>
              </div>

              <div className="confirm-detail">
                <div className="confirm-detail__label">Booker Type</div>
                <div className="confirm-detail__value" style={{ textTransform: 'capitalize' }}>
                  {booking.bookerType ? booking.bookerType.toLowerCase() : 'Visitor'}
                </div>
              </div>

              <div className="confirm-detail">
                <div className="confirm-detail__label">Quantity / Passes</div>
                <div className="confirm-detail__value">{booking.quantity}</div>
              </div>

              {booking.company && (
                <div className="confirm-detail">
                  <div className="confirm-detail__label">Company / Brand</div>
                  <div className="confirm-detail__value">{booking.company}</div>
                </div>
              )}

              <div className="confirm-detail">
                <div className="confirm-detail__label">Phone</div>
                <div className="confirm-detail__value">{booking.phone}</div>
              </div>

              {booking.amount != null && Number(booking.amount) > 0 && (
                <div className="confirm-detail">
                  <div className="confirm-detail__label">Amount</div>
                  <div className="confirm-detail__value">
                    ₹{Number(booking.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {booking.paymentReference && (
                <div className="confirm-detail">
                  <div className="confirm-detail__label">Payment Reference</div>
                  <div className="confirm-detail__value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {booking.paymentReference}
                  </div>
                </div>
              )}
            </div>

            <div className="confirm-actions" style={{ marginTop: '1.5rem' }}>
              <Link
                to={`/book/confirm?ref=${encodeURIComponent(booking.bookingRef)}&email=${encodeURIComponent(booking.email)}`}
                className="btn btn-outline"
                id="view-full-confirm-btn"
              >
                📄 View Confirmation Page
              </Link>

              <a
                href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20checking%20status%20for%20reference%20${booking.bookingRef}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                💬 WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
