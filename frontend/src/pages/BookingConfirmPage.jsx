import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { COMPANY_INFO } from '../constants/companyInfo';
import './BookingConfirmPage.css';

export default function BookingConfirmPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState(null);

  const refParam = searchParams.get('ref');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (booking) return;

    if (!refParam || !emailParam) {
      if (refParam && !emailParam) {
        setError('Please provide both booking reference and email to view details, or visit the Status Lookup page.');
      } else {
        setError('No booking details found. Please create a booking or lookup your reference.');
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    bookingApi.getStatus(refParam, emailParam)
      .then((data) => {
        setBooking(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch booking details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refParam, emailParam, booking]);

  const primaryWhatsApp = COMPANY_INFO?.whatsappNumbers?.[0] || '7219310525';

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="confirm-page">
        <div className="confirm-card" style={{ padding: '3rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
          <h3>Loading Booking Details...</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Fetching confirmation details from server.</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="confirm-page">
        <div className="confirm-card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Booking Details Unavailable</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            {error || 'We could not locate this booking. Please check your reference code or contact our support team.'}
          </p>
          <div className="confirm-actions">
            <Link to="/book/status" className="btn btn-primary">Check Status</Link>
            <Link to="/book" className="btn btn-outline">Book an Event</Link>
            <Link to="/" className="btn btn-ghost">Home</Link>
          </div>
        </div>
      </main>
    );
  }

  const isConfirmed = booking.bookingStatus === 'CONFIRMED';
  const bookingRef = booking.bookingRef || booking.bookingReference;
  const eventTitle = booking.eventName || booking.eventTitle || 'Shree Sakhi Exhibition';
  const totalAmount = booking.amount != null ? booking.amount : booking.totalAmount;

  return (
    <main className="confirm-page" id="booking-confirm-page">
      <div className="confirm-card">
        {/* Hero Banner */}
        <div className="confirm-card__hero">
          <span className="confirm-card__hero-icon" aria-hidden="true">
            {isConfirmed ? '🎉' : '⏳'}
          </span>
          <h2>{isConfirmed ? 'Booking Confirmed!' : 'Booking Received!'}</h2>
          <p>
            {isConfirmed
              ? 'Thank you! Your event booking and registration has been successfully confirmed.'
              : 'Your booking has been received and is being processed by the organizers.'}
          </p>

          <div className="confirm-ref-badge" title="Your Booking Reference Code">
            <span>REF:</span>
            <strong>{bookingRef}</strong>
          </div>
        </div>

        {/* Card Body */}
        <div className="confirm-card__body">
          <div className="confirm-details-grid">
            <div className="confirm-detail">
              <div className="confirm-detail__label">Event</div>
              <div className="confirm-detail__value">{eventTitle}</div>
            </div>

            <div className="confirm-detail">
              <div className="confirm-detail__label">Booker Name</div>
              <div className="confirm-detail__value">{booking.fullName}</div>
            </div>

            <div className="confirm-detail">
              <div className="confirm-detail__label">Category / Type</div>
              <div className="confirm-detail__value">
                <span style={{ textTransform: 'capitalize' }}>
                  {booking.bookerType ? booking.bookerType.toLowerCase() : 'Visitor'}
                </span>
                {booking.stallCategory && ` • ${booking.stallCategory}`}
              </div>
            </div>

            <div className="confirm-detail">
              <div className="confirm-detail__label">Phone & Email</div>
              <div className="confirm-detail__value" style={{ fontSize: '0.85rem' }}>
                {booking.phone}<br />
                <span style={{ color: 'var(--color-text-muted)' }}>{booking.email}</span>
              </div>
            </div>

            {booking.company && (
              <div className="confirm-detail">
                <div className="confirm-detail__label">Company / Brand</div>
                <div className="confirm-detail__value">{booking.company}</div>
              </div>
            )}

            <div className="confirm-detail">
              <div className="confirm-detail__label">Quantity / Passes</div>
              <div className="confirm-detail__value">{booking.quantity || 1}</div>
            </div>

            <div className="confirm-detail">
              <div className="confirm-detail__label">Booking Status</div>
              <div className="confirm-detail__value">
                <span className={`status-badge status-${booking.bookingStatus}`}>
                  {booking.bookingStatus}
                </span>
              </div>
            </div>

            <div className="confirm-detail">
              <div className="confirm-detail__label">Payment Status</div>
              <div className="confirm-detail__value">
                <span className={`status-badge pay-${booking.paymentStatus}`}>
                  {booking.paymentStatus}
                </span>
                {totalAmount != null && Number(totalAmount) > 0 && (
                  <span style={{ marginLeft: '8px', fontWeight: 700 }}>
                    ₹{Number(totalAmount).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {booking.paymentReference && (
              <div className="confirm-detail" style={{ gridColumn: 'span 2' }}>
                <div className="confirm-detail__label">Payment Reference</div>
                <div className="confirm-detail__value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {booking.paymentReference}
                </div>
              </div>
            )}
          </div>

          <div className="confirm-note">
            💡 <strong>Next Steps:</strong> Keep note of your reference code{' '}
            <strong>{bookingRef}</strong>. Our team will contact you on{' '}
            <strong>{booking.phone}</strong> with stall allocation, timing and entry guidelines prior to the exhibition.
          </div>

          {/* Action Buttons */}
          <div className="confirm-actions">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-outline"
              id="print-booking-btn"
            >
              🖨️ Print / Save
            </button>

            <a
              href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20have%20a%20booking%20(Ref:%20${bookingRef})`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              id="whatsapp-booking-support-btn"
            >
              💬 WhatsApp Support
            </a>

            <Link to="/book" className="btn btn-primary" id="book-another-btn">
              Book Another Event
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
