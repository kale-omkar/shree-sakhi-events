import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import StepIndicator from '../components/StepIndicator';
import './BookingPage.css';

const BOOKER_TYPES = [
  {
    value: 'VISITOR',
    icon: '🎟️',
    title: 'Visitor',
    desc: 'Attend the event as a general visitor',
    next: '/book/details',
  },
  {
    value: 'EXHIBITOR',
    icon: '🏪',
    title: 'Exhibitor',
    desc: 'Book a stall to showcase your products',
    next: '/book/stalls',
  },
  {
    value: 'SPONSOR',
    icon: '🤝',
    title: 'Sponsor',
    desc: 'Become a corporate sponsor for this event',
    next: '/book/stalls',
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

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedId = searchParams.get('eventId');

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(preselectedId || '');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [eventsLoading, setEventsLoading] = useState(true);

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

  useEffect(() => {
    if (eventId) {
      const found = events.find(e => String(e.id) === String(eventId));
      setSelectedEvent(found || null);
    } else {
      setSelectedEvent(null);
    }
  }, [eventId, events]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!eventId) { setServerError('Please select an event.'); return; }

    const digits = (form.phone || '').replace(/\D/g, '');
    let valid = true;
    const v = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) { v.fullName = 'Full name must be at least 2 characters.'; valid = false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { v.email = 'Enter a valid email address.'; valid = false; }
    if (!digits || !/^[6-9][0-9]{9}$/.test(digits)) { v.phone = 'Enter a valid 10-digit Indian mobile number (starting with 6-9).'; valid = false; }
    if (form.message && form.message.length > 500) { v.message = 'Message cannot exceed 500 characters.'; valid = false; }
    if (!form.consent) { v.consent = 'You must accept the terms and conditions to proceed.'; valid = false; }
    setErrors(v);
    if (!valid) return;

    setSubmitting(true);
    try {
      // Stash partial details into flow state so the details page can prefill
      sessionStorage.setItem('booking_flow', JSON.stringify({
        eventId: String(eventId),
        bookerType: form.bookerType,
        stallCodes: [],
        holdToken: null,
        sessionId: sessionStorage.getItem('stall_session_id') || null,
        prefill: {
          fullName: form.fullName.trim(),
          company: form.company.trim() || null,
          phone: form.phone.replace(/\D/g, ''),
          email: form.email.trim().toLowerCase(),
          quantity: Number(form.quantity),
          message: form.message.trim() || null,
          consent: form.consent,
        },
      }));

      const type = BOOKER_TYPES.find(t => t.value === form.bookerType);
      navigate(type.next, {
        state: {
          eventId: Number(eventId),
          bookerType: form.bookerType,
          fullName: form.fullName.trim(),
          company: form.company.trim() || null,
          phone: form.phone.replace(/\D/g, ''),
          email: form.email.trim().toLowerCase(),
          quantity: Number(form.quantity),
          message: form.message.trim() || null,
          consent: form.consent,
        },
      });
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = BOOKER_TYPES.find(t => t.value === form.bookerType) || BOOKER_TYPES[0];

  return (
    <main className="booking-page" id="booking-page">
      <section className="booking-hero">
        <div className="container booking-hero__inner">
          <span className="booking-hero__badge">📋 Book Your Spot</span>
          <h1>Book for an Event</h1>
          <p>
            Reserve your place at Shree Sakhi Events — as a visitor, exhibitor, or sponsor.
            Pick your event and booking type below, then choose your stall(s) and details.
          </p>

          <div className="booking-steps" aria-label="Booking process steps">
            <div className="booking-step active">
              <span className="booking-step__num">1</span>
              <span>Event &amp; Type</span>
            </div>
            <div className="booking-step__line" aria-hidden="true" />
            <div className="booking-step">
              <span className="booking-step__num">2</span>
              <span>Stalls</span>
            </div>
            <div className="booking-step__line" aria-hidden="true" />
            <div className="booking-step">
              <span className="booking-step__num">3</span>
              <span>Details</span>
            </div>
            <div className="booking-step__line" aria-hidden="true" />
            <div className="booking-step">
              <span className="booking-step__num">4</span>
              <span>Payment</span>
            </div>
            <div className="booking-step__line" aria-hidden="true" />
            <div className="booking-step">
              <span className="booking-step__num">5</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="booking-layout">
          <form id="booking-form" onSubmit={handleSubmit} noValidate>
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
                      onChange={e => { setEventId(e.target.value); setTouched(p => ({ ...p, eventId: true })); }}
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

              <div className="booking-form-section">
                <h2 className="booking-section-title">Your Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
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
                    {touched.fullName && errors.fullName && <span className="form-error">⚠ {errors.fullName}</span>}
                  </div>

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
                    {touched.company && errors.company && <span className="form-error">⚠ {errors.company}</span>}
                  </div>

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
                      {touched.phone && errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
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
                      {touched.email && errors.email && <span className="form-error">⚠ {errors.email}</span>}
                    </div>
                  </div>

                  {!selectedType ? null : null}
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-message">
                      Additional Message <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                    </label>
                    <textarea
                      id="booking-message"
                      className={`form-input ${touched.message && errors.message ? 'error' : ''}`}
                      rows={3}
                      placeholder="Special requirements or notes for the organizer…"
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
                    of Shree Sakhi Events. Final confirmation is subject to stall availability.
                  </span>
                </label>
                {touched.consent && errors.consent && (
                  <span className="form-error" style={{ marginTop: 'var(--space-sm)' }}>⚠ {errors.consent}</span>
                )}

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
                  style={{ marginTop: 'var(--space-lg)', width: '100%' }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      Continue →
                    </>
                  ) : (
                    <>
                      {selectedType.next === '/book/stalls'
                        ? 'Select Stalls →'
                        : 'Continue to Details →'
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

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
              ].map(item => (
                <div key={item.label} className="booking-summary-item">
                  <span className="booking-summary-item__label">{item.label}</span>
                  <span className="booking-summary-item__value">{item.value}</span>
                </div>
              ))}
              <div className="booking-summary-note">
                {form.bookerType === 'VISITOR'
                  ? 'Visitors proceed straight to details — no stall selection needed.'
                  : 'Exhibitors and sponsors select stall(s) on the floor plan before entering details.'}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
