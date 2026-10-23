import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { eventsApi, registrationsApi } from '../api/eventsApi';
import './RegisterPage.css';

const initialForm = {
  fullName: '', email: '', phone: '', city: '',
  organization: '', numberOfAttendees: 1, remarks: '',
};

function validate(form) {
  const errors = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters.';
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
  const digits = (form.phone || '').replace(/\D/g, '');
  if (!digits || digits.length < 10) errors.phone = 'Enter a valid 10-digit phone number.';
  if (form.numberOfAttendees < 1 || form.numberOfAttendees > 10) errors.numberOfAttendees = 'Attendees must be between 1 and 10.';
  if (form.remarks && form.remarks.length > 500) errors.remarks = 'Remarks cannot exceed 500 characters.';
  return errors;
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const preselectedId  = searchParams.get('eventId');

  const [events, setEvents]           = useState([]);
  const [selectedEventId, setEventId] = useState(preselectedId || '');
  const [selectedEvent, setSelected]  = useState(null);
  const [form, setForm]               = useState(initialForm);
  const [errors, setErrors]           = useState({});
  const [touched, setTouched]         = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(null);  // registration response
  const [serverError, setServerError] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Load available events
  useEffect(() => {
    eventsApi.getUpcoming()
      .then(data => {
        const open = data.filter(e => e.registrationStatus === 'OPEN');
        setEvents(open);
        if (preselectedId) {
          const found = open.find(e => String(e.id) === String(preselectedId));
          if (found) setSelected(found);
        }
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, [preselectedId]);

  // Update selected event details when ID changes
  useEffect(() => {
    if (selectedEventId) {
      const found = events.find(e => String(e.id) === String(selectedEventId));
      setSelected(found || null);
      if (!found && selectedEventId) {
        // Fetch from API if not in local list (e.g. came from URL directly)
        eventsApi.getById(selectedEventId).then(setSelected).catch(() => {});
      }
    } else {
      setSelected(null);
    }
  }, [selectedEventId, events]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsed = name === 'numberOfAttendees' ? parseInt(value) || 1 : value;
    const nextForm = { ...form, [name]: parsed };
    setForm(nextForm);
    
    // Automatically clear errors once valid
    setErrors(prev => {
      const updated = { ...prev };
      const errs = validate(nextForm);
      if (!errs[name]) {
        delete updated[name];
      } else if (touched[name]) {
        updated[name] = errs[name];
      }
      return updated;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    const errs = validate(form);
    setErrors(prev => {
      const updated = { ...prev };
      if (errs[name]) {
        updated[name] = errs[name];
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, numberOfAttendees: true, remarks: true });
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!selectedEventId) { setServerError('Please select an event to register for.'); return; }

    setSubmitting(true);
    setServerError(null);

    const result = await registrationsApi.register({
      ...form,
      eventId: parseInt(selectedEventId),
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(result.data);
    } else {
      // Check if it's validation errors (object) or string message
      if (typeof result.data === 'object' && result.data) {
        setErrors(result.data);
      } else {
        setServerError(result.message || 'Registration failed. Please try again.');
      }
    }
  };

  // ── Success Screen ──
  if (success) {
    return (
      <main id="register-success-page" className="register-page page-layout">
        <div className="container success-screen">
          <div className="success-icon" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.4)" strokeWidth="2"/>
              <path d="M20 32 L28 40 L44 24" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="success-title">You're Registered!</h1>
          <p className="success-subtitle">Welcome to <strong>{success.eventName}</strong></p>

          <div className="confirmation-card glass animate-scale-in">
            <div className="confirmation-code">
              <span className="confirmation-code__label">Confirmation Code</span>
              <span className="confirmation-code__value">{success.confirmationCode}</span>
            </div>
            <div className="confirmation-details">
              {[
                { label: 'Name',      value: success.fullName  },
                { label: 'Email',     value: success.email     },
                { label: 'Phone',     value: success.phone     },
                { label: 'Attendees', value: success.numberOfAttendees },
                { label: 'Status',    value: success.status    },
              ].map(row => (
                <div key={row.label} className="conf-row">
                  <span className="conf-label">{row.label}</span>
                  <span className="conf-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="success-note">
            📌 Save your confirmation code — you may need it for entry verification.
          </p>

          <div className="success-actions">
            <Link to="/events" className="btn btn-primary btn-lg" id="success-browse-events">Browse More Events</Link>
            <Link to="/" className="btn btn-ghost btn-lg" id="success-go-home">Back to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Form ──
  return (
    <main id="register-page" className="register-page page-layout">

      {/* Page Header */}
      <header className="page-hero" aria-labelledby="register-page-title">
        <div className="page-hero__bg" aria-hidden="true"/>
        <div className="container page-hero__content">
          <span className="section-label">Join Us</span>
          <h1 id="register-page-title">
            Event <span className="text-gradient">Registration</span>
          </h1>
          <p>Secure your spot at Shree Sakhi Events — fast, easy, and free</p>
        </div>
      </header>

      <div className="container register-page__body">
        <div className="register-layout">

          {/* ── Form Card ── */}
          <div className="register-form-wrap">
            <form
              className="register-form glass"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Event registration form"
            >
              <h2 className="register-form__title">Your Details</h2>

              {/* Event Selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="event-select">
                  Select Event <span className="req" aria-hidden="true">*</span>
                </label>
                {eventsLoading ? (
                  <div className="skeleton" style={{ height: 48 }}/>
                ) : (
                  <select
                    id="event-select"
                    name="eventId"
                    className="form-input"
                    value={selectedEventId}
                    onChange={e => setEventId(e.target.value)}
                    required
                    aria-required="true"
                  >
                    <option value="">-- Choose an event --</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                )}
                {events.length === 0 && !eventsLoading && (
                  <p className="form-error">No events are currently open for registration.</p>
                )}
              </div>

              <div className="form-divider" aria-hidden="true"/>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-fullName">
                  Full Name <span className="req" aria-hidden="true">*</span>
                </label>
                <input
                  id="reg-fullName" name="fullName" type="text"
                  className={`form-input ${touched.fullName && errors.fullName ? 'error' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={form.fullName}
                  onChange={handleChange} onBlur={handleBlur}
                  required aria-required="true"
                  aria-describedby={errors.fullName ? 'err-fullName' : undefined}
                />
                {touched.fullName && errors.fullName && (
                  <span id="err-fullName" className="form-error" role="alert">⚠ {errors.fullName}</span>
                )}
              </div>

              {/* Email + Phone */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">
                    Email Address <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-email" name="email" type="email"
                    className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    required aria-required="true"
                    aria-describedby={errors.email ? 'err-email' : undefined}
                  />
                  {touched.email && errors.email && (
                    <span id="err-email" className="form-error" role="alert">⚠ {errors.email}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">
                    Phone Number <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-phone" name="phone" type="tel"
                    className={`form-input ${touched.phone && errors.phone ? 'error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={handleChange} onBlur={handleBlur}
                    required aria-required="true"
                    maxLength={15}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                  />
                  {touched.phone && errors.phone && (
                    <span id="err-phone" className="form-error" role="alert">⚠ {errors.phone}</span>
                  )}
                </div>
              </div>

              {/* City + Organization */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-city">City</label>
                  <input
                    id="reg-city" name="city" type="text"
                    className="form-input"
                    placeholder="e.g. Nashik"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-organization">Organization / Business</label>
                  <input
                    id="reg-organization" name="organization" type="text"
                    className="form-input"
                    placeholder="Optional"
                    value={form.organization}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Number of Attendees */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-attendees">
                  Number of Attendees <span className="req" aria-hidden="true">*</span>
                </label>
                <div className="attendees-picker">
                  <button type="button" id="attendees-dec"
                          className="attendees-btn"
                          onClick={() => setForm(f => ({ ...f, numberOfAttendees: Math.max(1, f.numberOfAttendees - 1) }))}
                          aria-label="Decrease attendees">−</button>
                  <span id="reg-attendees" className="attendees-num" role="status" aria-label={`${form.numberOfAttendees} attendees`}>
                    {form.numberOfAttendees}
                  </span>
                  <button type="button" id="attendees-inc"
                          className="attendees-btn"
                          onClick={() => setForm(f => ({ ...f, numberOfAttendees: Math.min(10, f.numberOfAttendees + 1) }))}
                          aria-label="Increase attendees">+</button>
                </div>
                {touched.numberOfAttendees && errors.numberOfAttendees && (
                  <span className="form-error" role="alert">⚠ {errors.numberOfAttendees}</span>
                )}
              </div>

              {/* Remarks */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-remarks">Special Remarks <span style={{ opacity:0.5 }}>(Optional)</span></label>
                <textarea
                  id="reg-remarks" name="remarks"
                  className={`form-input ${touched.remarks && errors.remarks ? 'error' : ''}`}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  value={form.remarks}
                  onChange={handleChange} onBlur={handleBlur}
                  maxLength={500}
                  aria-describedby={errors.remarks ? 'err-remarks' : 'remarks-count'}
                />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {touched.remarks && errors.remarks
                    ? <span id="err-remarks" className="form-error" role="alert">⚠ {errors.remarks}</span>
                    : <span/>}
                  <span id="remarks-count" className="form-hint">{form.remarks.length}/500</span>
                </div>
              </div>

              {/* Server Error */}
              {serverError && (
                <div className="server-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                id="register-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg register-submit"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width:18, height:18, borderWidth:2 }} aria-hidden="true"/>
                    Registering...
                  </>
                ) : 'Complete Registration →'}
              </button>

              <p className="register-note">
                ✅ Registration is <strong>free</strong>. You'll receive a confirmation code upon successful registration.
              </p>
            </form>
          </div>

          {/* ── Event Preview Sidebar ── */}
          <aside className="register-sidebar" aria-label="Selected event preview">
            {selectedEvent ? (
              <div className="event-preview card animate-scale-in">
                <div className="event-preview__header">
                  <span className="badge badge-cat">{selectedEvent.category || 'Event'}</span>
                  <h3 className="event-preview__name">{selectedEvent.name}</h3>
                  <p className="event-preview__desc">{selectedEvent.description?.slice(0, 180)}...</p>
                </div>
                <div className="event-preview__info">
                  {[
                    { label: '📅 Date',  value: selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—' },
                    { label: '📍 Venue', value: selectedEvent.venue },
                    { label: '🎟️ Spots', value: selectedEvent.spotsLeft > 0 ? `${selectedEvent.spotsLeft} remaining` : 'Fully booked' },
                  ].map(row => (
                    <div key={row.label} className="event-preview__row">
                      <span className="event-preview__row-label">{row.label}</span>
                      <span className="event-preview__row-value">{row.value}</span>
                    </div>
                  ))}
                </div>
                <Link to={`/events/${selectedEvent.id}`} className="btn btn-ghost btn-sm" id="preview-view-details">
                  View Full Details →
                </Link>
              </div>
            ) : (
              <div className="event-preview-empty">
                <div className="event-preview-empty__icon" aria-hidden="true">🎪</div>
                <p>Select an event from the form to see its details here.</p>
                <Link to="/events" className="btn btn-outline btn-sm" id="preview-browse-events">Browse Events</Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
