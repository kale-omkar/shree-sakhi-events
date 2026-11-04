import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import StepIndicator from '../components/StepIndicator';

/**
 * Booking Details step (step 3) — personal details + stall selection recap.
 * Submits the booking with stallCodes + holdToken so the backend re-validates
 * the hold and computes the total from DB prices (never trusts the frontend).
 */
export default function DetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const eventId = state.eventId || null;
  const bookerType = state.bookerType || 'VISITOR';
  const stallCodes = state.stallCodes || [];
  const holdToken = state.holdToken || null;
  const sessionId = state.sessionId || null;
  const prefillAmount = state.amount || null;

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    bookerType,
    fullName: '',
    company: '',
    phone: '',
    email: '',
    quantity: bookerType === 'VISITOR' ? 1 : Math.max(stallCodes.length, 1),
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  const requiresStalls = bookerType === 'EXHIBITOR' || bookerType === 'SPONSOR';

  useEffect(() => {
    if (eventId) {
      // Reuse eventsApi to fetch the event name for the summary
      fetch(`http://localhost:8080/api/events/${eventId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          setEvent(data && data.data ? data.data : (data || null));
          setEventsLoading(false);
        })
        .catch(() => setEventsLoading(false));
    } else {
      setEventsLoading(false);
    }
  }, [eventId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const validate = () => {
    const e = {};
    if (!eventId) e.eventId = 'No event selected.';
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = 'Full name must be at least 2 characters.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.';
    const digits = (form.phone || '').replace(/\D/g, '');
    if (!digits || !/^[6-9][0-9]{9}$/.test(digits))
      e.phone = 'Enter a valid 10-digit Indian mobile number (starting with 6-9).';
    if (form.company && form.company.length > 150)
      e.company = 'Company name cannot exceed 150 characters.';
    const qty = Number(form.quantity);
    if (requiresStalls) {
      if (!qty || qty < 1) e.quantity = 'At least 1 stall is required.';
      if (qty !== stallCodes.length) e.quantity = `Please select exactly ${stallCodes.length} stall(s).`;
    } else {
      if (!qty || qty < 1) e.quantity = 'Quantity must be at least 1.';
      if (qty > 50) e.quantity = 'Maximum quantity is 50.';
    }
    if (form.message && form.message.length > 500)
      e.message = 'Message cannot exceed 500 characters.';
    if (!form.consent) e.consent = 'You must accept the terms and conditions.';
    return e;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) setErrors(validate());
  }, [form, touched, requiresStalls, stallCodes.length, eventId]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError(null);
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }

    setSubmitting(true);
    try {
      const payload = {
        eventId: Number(eventId),
        bookerType,
        fullName: form.fullName.trim(),
        company: form.company.trim() || null,
        phone: form.phone.replace(/\D/g, ''),
        email: form.email.trim().toLowerCase(),
        quantity: requiresStalls ? stallCodes.length : Number(form.quantity),
        message: form.message.trim() || null,
        consent: form.consent,
        stallCodes: requiresStalls ? stallCodes : [],
        holdToken,
        sessionId,
      };

      const result = await bookingApi.create(payload);

      if (result.success) {
        navigate('/book/pay', {
          state: {
            booking: result.data,
            message: result.message,
            stallCodes: requiresStalls ? stallCodes : [],
            amount: prefillAmount || result.data.amount,
          },
        });
      } else {
        setServerError(result.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => navigate('/book/stalls');

  const completed = new Set([1, 2]);

  if (eventsLoading) {
    return (
      <main className="details-page">
        <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
          <StepIndicator current={3} completed={completed} />
          <h1>Booking Details</h1>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, display: 'inline-block' }} />
          </div>
        </div>
      </main>
    );
  }

  const eventName = event ? event.name : 'Your Event';
  const stallList = stallCodes.join(', ') || '—';
  const stallTotal = prefillAmount != null ? `₹${Number(prefillAmount).toLocaleString('en-IN')}` : '—';

  return (
    <main className="details-page" id="booking-details-page">
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <StepIndicator current={3} completed={completed} />

        <div className="booking-layout">
          {/* LEFT: Form */}
          <form id="details-form" onSubmit={handleSubmit} noValidate>
            <div className="booking-form-card">
              <div className="booking-form-section">
                <h2 className="booking-section-title">Event &amp; Stalls</h2>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <input className="form-input" value={eventName} readOnly />
                </div>
                {requiresStalls && (
                  <div className="form-group">
                    <label className="form-label">Booker Type</label>
                    <input className="form-input" value={bookerType.charAt(0) + bookerType.slice(1).toLowerCase()} readOnly />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Selected Stall(s)</label>
                  <input className="form-input" value={stallList} readOnly />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Server total (from stall prices): {stallTotal}
                  </span>
                </div>
              </div>

              <div className="booking-form-section">
                <h2 className="booking-section-title">Your Details</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="details-fullname">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="details-fullname"
                    className={`form-input ${touched.fullName && errors.fullName ? 'error' : ''}`}
                    placeholder="e.g. Priya Sharma"
                    value={form.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    autoComplete="name"
                  />
                  {touched.fullName && errors.fullName && <span className="form-error">⚠ {errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="details-company">
                    Company / Business Name
                    {requiresStalls ? <span className="req">*</span> : <span style={{ color: 'var(--color-text-subtle)', marginLeft: 6 }}>(optional)</span>}
                  </label>
                  <input
                    id="details-company"
                    className={`form-input ${touched.company && errors.company ? 'error' : ''}`}
                    placeholder={requiresStalls ? 'Your company or brand name' : 'Your company or business (optional)'}
                    value={form.company}
                    onChange={e => handleChange('company', e.target.value)}
                    onBlur={() => handleBlur('company')}
                  />
                  {touched.company && errors.company && <span className="form-error">⚠ {errors.company}</span>}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="details-phone">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      id="details-phone"
                      type="tel"
                      className={`form-input ${touched.phone && errors.phone ? 'error' : ''}`}
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                    />
                    {touched.phone && errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="details-email">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="details-email"
                      type="email"
                      className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      autoComplete="email"
                    />
                    {touched.email && errors.email && <span className="form-error">⚠ {errors.email}</span>}
                  </div>
                </div>

                {!requiresStalls && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="details-quantity">
                      Number of Attendees <span className="req">*</span>
                    </label>
                    <input
                      id="details-quantity"
                      type="number"
                      className={`form-input ${touched.quantity && errors.quantity ? 'error' : ''}`}
                      placeholder="How many people will attend?"
                      value={form.quantity}
                      min={1}
                      max={50}
                      onChange={e => handleChange('quantity', e.target.value)}
                      onBlur={() => handleBlur('quantity')}
                    />
                    {touched.quantity && errors.quantity && <span className="form-error">⚠ {errors.quantity}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="details-message">
                    Additional Message <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                  </label>
                  <textarea
                    id="details-message"
                    className={`form-input ${touched.message && errors.message ? 'error' : ''}`}
                    rows={3}
                    placeholder="Special requirements or notes for the organizer…"
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                  {touched.message && errors.message && <span className="form-error">⚠ {errors.message}</span>}
                </div>
              </div>

              <div className="booking-form-section">
                <label className="consent-row" htmlFor="details-consent" id="details-consent-label">
                  <input
                    id="details-consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => handleChange('consent', e.target.checked)}
                  />
                  <span className="consent-text">
                    I confirm that the details provided are accurate and I agree to the booking terms
                    of Shree Sakhi Events.
                  </span>
                </label>
                {touched.consent && errors.consent && (
                  <span className="form-error" style={{ marginTop: 'var(--space-sm)' }}>⚠ {errors.consent}</span>
                )}

                {serverError && (
                  <div className="booking-server-error" role="alert" style={{ marginTop: 'var(--space-md)' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  id="details-submit-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ marginTop: 'var(--space-lg)', width: '100%' }}
                >
                  {submitting ? (
                    <>Creating booking…</>
                  ) : (
                    requiresStalls ? <>Confirm &amp; Proceed to Payment →</> : <>Continue to Payment →</>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* RIGHT: Summary */}
          <aside className="booking-summary-card">
            <div className="booking-summary-header">
              <h3>Booking Summary</h3>
              <p>Review before submitting</p>
            </div>
            <div className="booking-summary-body">
              {[
                { label: 'Event', value: eventName },
                { label: 'Booking Type', value: bookerType.charAt(0) + bookerType.slice(1).toLowerCase() },
                { label: requiresStalls ? 'Selected Stalls' : 'Attendees', value: requiresStalls ? stallList : form.quantity || '—' },
                { label: 'Total (server-calculated)', value: stallTotal },
                { label: 'Name', value: form.fullName || '—' },
                { label: 'Email', value: form.email || '—' },
                { label: 'Phone', value: form.phone || '—' },
              ].map(item => (
                <div key={item.label} className="booking-summary-item">
                  <span className="booking-summary-item__label">{item.label}</span>
                  <span className="booking-summary-item__value">{item.value}</span>
                </div>
              ))}
              <div className="booking-summary-note">
                💡 Your stall hold remains active while you complete this form.{' '}
                <strong>Do not refresh or close this tab</strong> or the hold may expire.
              </div>
            </div>
            <div className="confirm-actions" style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="button" onClick={handleBack} className="btn btn-outline" style={{ flex: 1 }}>
                ← Back to Stalls
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
