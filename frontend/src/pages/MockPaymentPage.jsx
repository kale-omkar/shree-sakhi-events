import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import './MockPaymentPage.css';

/**
 * Mock / Test Payment Page — Jatin Patil's module.
 *
 * CLEARLY LABELLED "TEST MODE — No real money charged".
 * Flow:
 *  1. Frontend calls POST /api/bookings/{ref}/initiate-payment → gets mock reference
 *  2. User clicks "Make Test Payment"
 *  3. Frontend calls POST /api/bookings/{ref}/confirm-payment with reference + signature
 *  4. Backend verifies → marks PAID → returns updated booking
 *  5. Navigate to /book/confirm
 *
 * Switching to Razorpay sandbox: replace initiatePayment/confirmPayment calls with
 * Razorpay SDK integration. Signature verification stays on the backend.
 */
export default function MockPaymentPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { booking, message } = location.state || {};

  const [paying, setPaying]   = useState(false);
  const [error, setError]     = useState('');
  const [initiated, setInitiated] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  // Guard: if navigated here without state, redirect to booking page
  if (!booking?.bookingRef) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <div className="payment-card__body" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>⚠️</p>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>No Booking Found</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
              Please start a new booking.
            </p>
            <Link to="/book" className="btn btn-primary">Make a Booking</Link>
          </div>
        </div>
      </main>
    );
  }

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      // Step 1: Initiate payment (gets mock reference from backend)
      let ref = paymentRef;
      if (!initiated) {
        const result = await bookingApi.initiatePayment(booking.bookingRef);
        ref = result.reference;
        setPaymentRef(ref);
        setInitiated(true);
      }

      // Step 2: Confirm payment on backend (backend verifies before marking PAID)
      const confirmed = await bookingApi.confirmPayment(booking.bookingRef, ref, 'mock');

      // Step 3: Navigate to confirmation page
      navigate('/book/confirm', { state: { booking: confirmed, message: 'Payment successful! Your booking is confirmed.' } });

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleSkipPayment = () => {
    // Allow viewing confirmation without payment (booking stays PENDING)
    navigate('/book/confirm', { state: { booking, message } });
  };

  return (
    <main className="payment-page" id="mock-payment-page">
      <div className="payment-card">

        {/* ── Header ── */}
        <div className="payment-card__header">
          <div className="payment-test-badge">⚠ TEST MODE — NO REAL MONEY</div>
          <h2>Complete Test Payment</h2>
          <p>This is a sandbox simulation. No real payment is processed.</p>
        </div>

        {/* ── Body ── */}
        <div className="payment-card__body">

          {/* Booking Reference */}
          <div className="payment-ref-box">
            <div className="payment-ref-label">Booking Reference</div>
            <div className="payment-ref-value" id="payment-booking-ref">{booking.bookingRef}</div>
          </div>

          {/* Details */}
          <div className="payment-field">
            <span className="payment-field__label">Event</span>
            <span className="payment-field__value">{booking.eventName}</span>
          </div>
          <div className="payment-field">
            <span className="payment-field__label">Booking Type</span>
            <span className="payment-field__value">{booking.bookerType}</span>
          </div>
          <div className="payment-field">
            <span className="payment-field__label">Name</span>
            <span className="payment-field__value">{booking.fullName}</span>
          </div>
          <div className="payment-field">
            <span className="payment-field__label">Amount</span>
            <span className="payment-field__value" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {booking.amount ? `₹${booking.amount}` : 'Pending confirmation'}
            </span>
          </div>

          {/* Mock Card Visual */}
          <div className="payment-mock-card" aria-label="Test payment card (not real)">
            <div className="payment-mock-chip" aria-hidden="true" />
            <div className="payment-mock-number">4242  4242  4242  4242</div>
            <div className="payment-mock-meta">
              <span>TEST CARD — DO NOT USE REAL DETAILS</span>
              <span>12/99</span>
            </div>
          </div>

          {/* Warning */}
          <div className="payment-warning" role="alert">
            ⚠️ <strong>TEST MODE ONLY</strong><br />
            This payment screen is for development and demonstration purposes only.
            No real payment gateway is connected. No real money will be charged.
            <br /><br />
            <em>Pending client confirmation:</em> Razorpay sandbox integration
            will be enabled once the merchant account and API keys are provided.
          </div>

          {/* Error */}
          {error && (
            <div className="payment-error" role="alert">⚠️ {error}</div>
          )}

          {/* Pay Button */}
          <button
            id="mock-pay-btn"
            className="btn btn-primary payment-pay-btn"
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? (
              <>
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Processing…
              </>
            ) : (
              <>🔐 Make Test Payment</>
            )}
          </button>

          {/* Skip */}
          <button
            id="skip-payment-btn"
            type="button"
            className="payment-back-link"
            onClick={handleSkipPayment}
            style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
          >
            Skip payment — view booking confirmation
          </button>

        </div>
      </div>
    </main>
  );
}
