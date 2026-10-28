import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import { bookingApi } from '../api/bookingApi';
import './BookingPage.css';

// ── Constants ──────────────────────────────────────────────────────────────

const BOOKER_TYPES = [
  {
    value: 'VISITOR',
    icon: '🎟️',
    title: 'Visitor',
    desc: 'Attend the event as a general visitor',
    quantityLabel: 'Number of Attendees',
    quantityHint: 'How many people will attend?',
  },
  {
    value: 'EXHIBITOR',
    icon: '🏪',
    title: 'Exhibitor',
    desc: 'Book a stall to showcase your products',
    quantityLabel: 'Number of Stalls',
    quantityHint: 'How many stalls do you require?',
  },
  {
    value: 'SPONSOR',
    icon: '🤝',
    title: 'Sponsor',
    desc: 'Become a corporate sponsor for this event',
    quantityLabel: 'Sponsorship Slots',
    quantityHint: 'Number of sponsorship slots required',
  },
];

const INITIAL_FORM = {
  bookerType: 'VISITOR',
  fullName: '',
  company: '',
  phone: '',
  email: '',
  quantity: 1,
  message: '',
  consent: false,
};

// ── Validation ──────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};

  if (!form.fullName.trim() || form.fullName.trim().length < 2)
    errors.fullName = 'Full name must be at least 2 characters.';

  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address.';

  const digits = (form.phone || '').replace(/\D/g, '');
  if (!digits || !/^[6-9][0-9]{9}$/.test(digits))
    errors.phone = 'Enter a valid 10-digit Indian mobile number (starting with 6-9).';

  if (form.company && form.company.length > 150)
    errors.company = 'Company name cannot exceed 150 characters.';

  const qty = Number(form.quantity);
  if (!qty || qty < 1) errors.quantity = 'Quantity must be at least 1.';
  if (qty > 50)        errors.quantity = 'Maximum quantity is 50.';

  if (form.message && form.message.length > 500)
    errors.message = 'Message cannot exceed 500 characters.';

  if (!form.consent)
    errors.consent = 'You must accept the terms and conditions to proceed.';

  return errors;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const preselectedId  = searchParams.get('eventId');

  // State
  const [events, setEvents]         = useState([]);
  const [eventId, setEventId]       = useState(preselectedId || '');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm]             = useState({ ...INITIAL_FORM });
  const [errors, setErrors]         = useState({});
  const [touched, setTouched]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [eventsLoading, setEventsLoading] = useState(true);

  // Load upcoming events with open bookings
  useEffect(() => {
    eventsApi.getUpcoming()
      .then(data => {
        const open = data.filter(e =>
          e.registrationStatus === 'OPEN' || e.registrationStatus === 'COMING_SOON'
        );
        setEvents(open);
        if (preselectedId) {
          const found = open.find(e => String(e.id) === String(preselectedId));
          if (found) setSelectedEvent(found);
          else eventsApi.getById(preselectedId).then(setSelectedEvent).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, [preselectedId]);

  // Sync selectedEvent when eventId changes
  useEffect(() => {
    if (eventId) {
      const found = events.find(e => String(e.id) === String(eventId));
      setSelectedEvent(found || null);
    } else {
      setSelectedEvent(null);
    }
  }, [eventId, events]);

  // Live validation after first touch
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate(form));
    }
  }, [form, touched]);

  // Handlers
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Touch all fields to show all errors
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!eventId) { setServerError('Please select an event.'); return; }

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        eventId:    Number(eventId),
        bookerType: form.bookerType,
        fullName:   form.fullName.trim(),
        company:    form.company.trim() || null,
        phone:      form.phone.replace(/\D/g, ''),
        email:      form.email.trim().toLowerCase(),
        quantity:   Number(form.quantity),
        message:    form.message.trim() || null,
        consent:    form.consent,
      };

      const result = await bookingApi.create(payload);

      if (result.success) {
        // Navigate to mock payment page with booking data
        navigate('/book/pay', { state: { booking: result.data, message: result.message } });
      } else {
        setServerError(result.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = BOOKER_TYPES.find(t => t.value === form.bookerType) || BOOKER_TYPES[0];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="booking-page" id="booking-page">

      {/* ── Hero ── */}
      <section className="booking-hero">
        <div className="container booking-hero__inner">
          <span className="booking-hero__badge">📋 Book Your Spot</span>
          <h1>Book for an Event</h1>
          <p>
            Reserve your place at Shree Sakhi Events — as a visitor, exhibitor, or sponsor.
            Fill in the form below to get your booking reference instantly.
          </p>

          {/* Progress Steps */}
          <div className="booking-steps" aria-label="Booking process steps">
            <div className="booking-step active">
              <span className="booking-step__num">1</span>
              <span>Fill Details</span>
            </div>
            <div className="booking-step__line" aria-hidden="true" />
            <div className="booking-step">
              <span className="booking-step__num">2</span>
              <span>Test Payment</span>
            </div>
            <div className="booking-step__line" aria-hidden="true" />
            <div className="booking-step">
              <span className="booking-step__num">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <div className="container">
        <div className="booking-layout">

          {/* ── LEFT: Form ── */}
          <form id="booking-form" onSubmit={handleSubmit} noValidate>

            {/* Section 1: Event Selection */}
            <div className="booking-form-card animate-fade-up">
              <div className="booking-form-section">
                <h2 className="booking-section-title">Select Event</h2>
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-event-select">
                    Event <span className="req">*</span>
                  </label>
                  {eventsLoading ? (
                    <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    <select
                      id="booking-event-select"
                      className={`form-input ${!eventId && touched.eventId ? 'error' : ''}`}
                      value={eventId}
                      onChange={e => { setEventId(e.target.value); setTouched(p => ({...p, eventId: true})); }}
                      onBlur={() => handleBlur('eventId')}
                    >
                      <option value="">— Choose an event —</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} — {ev.eventDate} · {ev.venue}
                        </option>
                      ))}
                    </select>
                  )}
                  {!eventId && touched.eventId && (
                    <span className="form-error">⚠ Please select an event.</span>
                  )}
                </div>
              </div>

              {/* Section 2: Booker Type */}
              <div className="booking-form-section">
                <h2 className="booking-section-title">I am booking as</h2>
                <div className="booker-type-grid" role="radiogroup" aria-label="Booker type">
                  {BOOKER_TYPES.map(type => (
                    <div
                      key={type.value}
                      className={`booker-type-card ${form.bookerType === type.value ? 'selected' : ''}`}
                      onClick={() => handleChange('bookerType', type.value)}
                      role="radio"
                      aria-checked={form.bookerType === type.value}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleChange('bookerType', type.value)}
                      id={`booker-type-${type.value.toLowerCase()}`}
                    >
                      <div className="booker-type-card__check" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 10" fill="none">
                          <polyline points="1 5 4.5 8.5 11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="booker-type-card__icon">{type.icon}</span>
                      <div className="booker-type-card__title">{type.title}</div>
                      <div className="booker-type-card__desc">{type.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Personal Details */}
              <div className="booking-form-section">
                <h2 className="booking-section-title">Your Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-fullname">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="booking-fullname"
                      type="text"
                      className={`form-input ${touched.fullName && errors.fullName ? 'error' : ''}`}
                      placeholder="e.g. Priya Sharma"
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      autoComplete="name"
                    />
                    {touched.fullName && errors.fullName && (
                      <span className="form-error">⚠ {errors.fullName}</span>
                    )}
                  </div>

                  {/* Company (optional for visitors) */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-company">
                      Company / Business Name
                      {form.bookerType === 'VISITOR' && (
                        <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                      )}
                      {form.bookerType !== 'VISITOR' && <span className="req">*</span>}
                    </label>
                    <input
                      id="booking-company"
                      type="text"
                      className={`form-input ${touched.company && errors.company ? 'error' : ''}`}
                      placeholder={form.bookerType === 'VISITOR' ? 'Your company or business (optional)' : 'Your company or brand name'}
                      value={form.company}
                      onChange={e => handleChange('company', e.target.value)}
                      onBlur={() => handleBlur('company')}
                    />
                    {touched.company && errors.company && (
                      <span className="form-error">⚠ {errors.company}</span>
                    )}
                  </div>

                  {/* Phone + Email grid */}
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-phone">
                        Mobile Number <span className="req">*</span>
                      </label>
                      <input
                        id="booking-phone"
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
                      {touched.phone && errors.phone && (
                        <span className="form-error">⚠ {errors.phone}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-email">
                        Email Address <span className="req">*</span>
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        autoComplete="email"
                      />
                      {touched.email && errors.email && (
                        <span className="form-error">⚠ {errors.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-quantity">
                      {selectedType.quantityLabel} <span className="req">*</span>
                    </label>
                    <input
                      id="booking-quantity"
                      type="number"
                      className={`form-input ${touched.quantity && errors.quantity ? 'error' : ''}`}
                      placeholder={selectedType.quantityHint}
                      value={form.quantity}
                      min={1}
                      max={50}
                      onChange={e => handleChange('quantity', e.target.value)}
                      onBlur={() => handleBlur('quantity')}
                    />
                    {touched.quantity && errors.quantity && (
                      <span className="form-error">⚠ {errors.quantity}</span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-message">
                      Additional Message
                      <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                    </label>
                    <textarea
                      id="booking-message"
                      className={`form-input ${touched.message && errors.message ? 'error' : ''}`}
                      rows={3}
                      placeholder="Any special requirements, questions, or notes for the organizer…"
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      style={{ resize: 'vertical', minHeight: '80px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {touched.message && errors.message ? (
                        <span className="form-error">⚠ {errors.message}</span>
                      ) : <span />}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                        {form.message.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Consent + Submit */}
              <div className="booking-form-section">
                <label className="consent-row" htmlFor="booking-consent" id="consent-label">
                  <input
                    id="booking-consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => handleChange('consent', e.target.checked)}
                  />
                  <span className="consent-text">
                    I confirm that the details provided are accurate and I agree to the booking terms
                    of Shree Sakhi Events. I understand that this is a booking request and final
                    confirmation is subject to event availability.
                  </span>
                </label>
                {touched.consent && errors.consent && (
                  <span className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
                    ⚠ {errors.consent}
                  </span>
                )}

                {/* Server error */}
                {serverError && (
                  <div className="booking-server-error" role="alert">
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  id="booking-submit-btn"
                  type="submit"
                  className="btn btn-primary booking-submit-btn"
                  disabled={submitting}
                  style={{ marginTop: 'var(--space-lg)' }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Continue to Payment →
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* ── RIGHT: Summary Sidebar ── */}
          <aside className="booking-summary-card animate-fade-up delay-100">
            <div className="booking-summary-header">
              <h3>Booking Summary</h3>
              <p>Review before submitting</p>
            </div>
            <div className="booking-summary-body">
              {[
                { label: 'Event', value: selectedEvent ? selectedEvent.name : '—' },
                { label: 'Date', value: selectedEvent ? selectedEvent.eventDate : '—' },
                { label: 'Venue', value: selectedEvent ? selectedEvent.venue : '—' },
                { label: 'Booking Type', value: selectedType.title },
                { label: selectedType.quantityLabel, value: form.quantity || '—' },
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
                💡 <strong>What happens next?</strong><br />
                After submission you'll be taken to a test payment screen.
                Your booking reference will be emailed to you automatically.
                <br /><br />
                ⚠️ <em>Pending client confirmation:</em> Stall fees and capacity
                rules will be confirmed by the organizer.
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
