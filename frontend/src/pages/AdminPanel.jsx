import { useState, useEffect, useCallback } from 'react';
import { adminEventsApi } from '../api/adminApi';
import AdminBookingsSection from '../components/AdminBookingsSection';
import './AdminPanel.css';

const EMPTY_FORM = {
  name: '', description: '', eventDate: '', endDate: '',
  venue: '', venueAddress: '', eventType: 'UPCOMING',
  registrationStatus: 'OPEN', imageUrl: '', bannerUrl: '',
  maxCapacity: '', registeredCount: '', highlights: '',
  tags: '', category: '', organizer: '',
  contactEmail: '', contactPhone: '', isFeatured: false,
};

const STATUS_LABELS = {
  OPEN: { label: 'Open', cls: 'badge-open' },
  CLOSED: { label: 'Closed', cls: 'badge-closed' },
  COMING_SOON: { label: 'Coming Soon', cls: 'badge-coming' },
  NOT_REQUIRED: { label: 'Free Entry', cls: 'badge-open' },
};

const TYPE_LABELS = {
  UPCOMING: '🟢 Upcoming',
  ONGOING: '🟡 Ongoing',
  PAST: '⚫ Past',
};

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminPanel() {
  const todayStr = getTodayStr();

  // ── Auth state ──
  const [authed, setAuthed]   = useState(() => {
    return sessionStorage.getItem('admin_authed') === 'true' &&
      Boolean(sessionStorage.getItem('admin_api_key') || import.meta.env.VITE_ADMIN_KEY);
  });
  const [loginKey, setLoginKey] = useState('');
  const [loginErr, setLoginErr] = useState('');

  // ── Data state ──
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'bookings'
  const [view, setView]       = useState('list'); // 'list' | 'form' | 'confirm-delete'
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null); // { msg, type }
  const [searchQ, setSearchQ] = useState('');

  // ── Load events ──
  const loadEvents = useCallback(() => {
    if (!authed) return;
    setLoading(true);
    setError(null);
    adminEventsApi.getAll()
      .then(setEvents)
      .catch(err => {
        if (err.message && err.message.toLowerCase().includes('unauthorised')) {
          sessionStorage.removeItem('admin_authed');
          sessionStorage.removeItem('admin_api_key');
          setAuthed(false);
          setEvents([]);
          setLoginErr('Session expired or invalid admin API key. Please sign in again.');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [authed]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    const key = loginKey.trim();
    if (!key) {
      setLoginErr('Admin key is required.');
      return;
    }
    setLoginErr('');
    setLoading(true);
    try {
      await adminEventsApi.getAll(key);
      sessionStorage.setItem('admin_api_key', key);
      sessionStorage.setItem('admin_authed', 'true');
      setAuthed(true);
      setLoginKey('');
    } catch (err) {
      setLoginErr(err.message || 'Invalid admin key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed');
    sessionStorage.removeItem('admin_api_key');
    setAuthed(false);
    setEvents([]);
  };

  // ── Toast ──
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Form helpers ──
  const openCreate = () => {
    setEditingEvent(null);
    setFormData({ ...EMPTY_FORM });
    setFormErrors({});
    setView('form');
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name || '',
      description: event.description || '',
      eventDate: event.eventDate || '',
      endDate: event.endDate || '',
      venue: event.venue || '',
      venueAddress: event.venueAddress || '',
      eventType: event.eventType || 'UPCOMING',
      registrationStatus: event.registrationStatus || 'OPEN',
      imageUrl: event.imageUrl || '',
      bannerUrl: event.bannerUrl || '',
      maxCapacity: event.maxCapacity ?? '',
      registeredCount: event.registeredCount ?? '',
      highlights: (event.highlights || []).join('\n'),
      tags: (event.tags || []).join(', '),
      category: event.category || '',
      organizer: event.organizer || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      isFeatured: !!event.isFeatured,
    });
    setFormErrors({});
    setView('form');
  };

  const openDelete = (event) => {
    setDeletingEvent(event);
    setView('confirm-delete');
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Event name is required';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Event name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }

    if (!formData.eventDate) {
      errs.eventDate = 'Event date is required';
    } else if (formData.eventType !== 'PAST' && formData.eventDate < todayStr) {
      errs.eventDate = 'Start date cannot be in the past for upcoming events';
    }
    if (!formData.venue.trim()) errs.venue = 'Venue is required';
    if (!formData.eventType) errs.eventType = 'Event type is required';
    if (!formData.registrationStatus) errs.registrationStatus = 'Registration status is required';
    if (formData.endDate && formData.eventDate && formData.endDate < formData.eventDate)
      errs.endDate = 'End date cannot be before start date';
    if (formData.maxCapacity && Number(formData.maxCapacity) < 1)
      errs.maxCapacity = 'Capacity must be at least 1';
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail))
      errs.contactEmail = 'Invalid email address';
    if (formData.contactPhone) {
      const cleaned = formData.contactPhone.replace(/[\s\-]/g, '');
      if (!/^(\+91|0)?[6-9]\d{9}$/.test(cleaned)) {
        errs.contactPhone = 'Please enter a valid 10-digit mobile number (e.g. 9876543210 or +91 98765 43210)';
      }
    }
    return errs;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        eventDate: formData.eventDate || null,
        endDate: formData.endDate || null,
        venue: formData.venue.trim(),
        venueAddress: formData.venueAddress?.trim() || null,
        eventType: formData.eventType,
        registrationStatus: formData.registrationStatus,
        imageUrl: formData.imageUrl?.trim() || null,
        bannerUrl: formData.bannerUrl?.trim() || null,
        maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : null,
        registeredCount: formData.registeredCount ? Number(formData.registeredCount) : 0,
        highlights: formData.highlights
          ? formData.highlights.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        tags: formData.tags
          ? formData.tags.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        category: formData.category?.trim() || null,
        organizer: formData.organizer?.trim() || null,
        contactEmail: formData.contactEmail?.trim() || null,
        contactPhone: formData.contactPhone ? formData.contactPhone.replace(/[\s\-]/g, '') : null,
        isFeatured: !!formData.isFeatured,
      };

      if (editingEvent) {
        await adminEventsApi.update(editingEvent.id, payload);
        showToast('✅ Event updated successfully!');
      } else {
        await adminEventsApi.create(payload);
        showToast('✅ Event created successfully!');
      }
      setView('list');
      loadEvents();
    } catch (err) {
      showToast('❌ ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deletingEvent) return;
    setSaving(true);
    try {
      await adminEventsApi.delete(deletingEvent.id);
      showToast('🗑️ Event deleted successfully.');
      setView('list');
      loadEvents();
    } catch (err) {
      showToast('❌ ' + err.message, 'error');
    } finally {
      setSaving(false);
      setDeletingEvent(null);
    }
  };

  // ── Toggle featured ──
  const handleToggleFeatured = async (event) => {
    try {
      await adminEventsApi.toggleFeatured(event.id);
      showToast(event.isFeatured ? '⭐ Removed from featured' : '⭐ Marked as featured');
      loadEvents();
    } catch (err) {
      showToast('❌ ' + err.message, 'error');
    }
  };

  // ── Filter events ──
  const filteredEvents = events.filter(e =>
    e.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.venue?.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ── Login screen ──
  if (!authed) {
    return (
      <main id="admin-login-page" className="admin-login-page">
        <div className="admin-login-card glass">
          <div className="admin-login-logo" aria-hidden="true">🔐</div>
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-sub">Shree Sakhi Events — Event Management</p>
          <form onSubmit={handleLogin} className="admin-login-form" noValidate>
            <div className="form-group">
              <label htmlFor="admin-key-input" className="form-label">
                Admin Key <span className="req">*</span>
              </label>
              <input
                id="admin-key-input"
                type="password"
                className={`form-input ${loginErr ? 'error' : ''}`}
                placeholder="Enter admin key"
                value={loginKey}
                onChange={e => setLoginKey(e.target.value)}
                autoComplete="current-password"
                required
              />
              {loginErr && <span className="form-error">⚠ {loginErr}</span>}
            </div>
            <button type="submit" className="btn btn-primary" id="admin-login-btn"
                    style={{ width: '100%', marginTop: '0.5rem' }}>
              Sign In
            </button>
          </form>
          <p className="admin-login-hint">
            Enter the admin API key configured in your backend environment (<code>ADMIN_API_KEY</code>).
          </p>
        </div>
      </main>
    );
  }

  return (
    <main id="admin-panel" className="admin-panel">

      {/* ── Toast ── */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`} role="alert" aria-live="polite">
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="admin-header">
        <div className="admin-header__left">
          <div className="admin-header__logo" aria-hidden="true">🌸</div>
          <div>
            <h1 className="admin-header__title">Admin Panel</h1>
            <p className="admin-header__sub">Shree Sakhi Events — Event Management</p>
          </div>
        </div>
        <div className="admin-header__right">
          {activeTab === 'events' && view !== 'list' && (
            <button className="btn btn-ghost btn-sm" onClick={() => setView('list')} id="admin-back-btn">
              ← Back to List
            </button>
          )}
          {activeTab === 'events' && view === 'list' && (
            <button className="btn btn-primary btn-sm" onClick={openCreate} id="admin-create-btn">
              + New Event
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      <div className="admin-body">

        {/* ── Tab Switcher: Events vs Bookings ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('events')}
            id="admin-tab-events"
          >
            🎪 Events Management
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('bookings')}
            id="admin-tab-bookings"
          >
            🎟️ Bookings & Stalls
          </button>
        </div>

        {activeTab === 'bookings' && (
          <AdminBookingsSection showToast={showToast} />
        )}

        {activeTab === 'events' && (
          <>
            {/* ── Stats bar ── */}
        {view === 'list' && !loading && !error && (
          <div className="admin-stats">
            {[
              { label: 'Total Events', val: events.length, icon: '📋' },
              { label: 'Upcoming',     val: events.filter(e => e.eventType === 'UPCOMING').length, icon: '🟢' },
              { label: 'Past',         val: events.filter(e => e.eventType === 'PAST').length,     icon: '⚫' },
              { label: 'Featured',     val: events.filter(e => e.isFeatured).length,               icon: '⭐' },
              { label: 'Open Reg.',    val: events.filter(e => e.registrationStatus === 'OPEN').length, icon: '🎟️' },
            ].map(s => (
              <div key={s.label} className="admin-stat">
                <span className="admin-stat__icon">{s.icon}</span>
                <span className="admin-stat__val">{s.val}</span>
                <span className="admin-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div className="admin-list">
            {/* Search */}
            <div className="admin-list__search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" aria-hidden="true" className="admin-search-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="admin-search-input"
                type="search"
                placeholder="Search events by name, venue or category…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="form-input admin-list__search-input"
                aria-label="Search admin events"
              />
            </div>

            {loading ? (
              <div className="admin-loading" aria-busy="true">
                <div className="spinner"/>
                <p>Loading events…</p>
              </div>
            ) : error ? (
              <div className="admin-error" role="alert">
                <p>⚠ Unable to load events: {error}</p>
                <button className="btn btn-outline btn-sm" onClick={loadEvents}>Retry</button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="admin-empty">
                <p>📋 {searchQ ? 'No events match your search.' : 'No events yet. Create the first one!'}</p>
                {!searchQ && <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Create Event</button>}
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table" aria-label="Events list">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Venue</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Capacity</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => (
                      <tr key={event.id} className="admin-table__row">
                        <td className="admin-table__name">
                          <strong>{event.name}</strong>
                          {event.category && <span className="admin-table__cat badge badge-cat">{event.category}</span>}
                        </td>
                        <td className="admin-table__date">
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="admin-table__venue">{event.venue || '—'}</td>
                        <td>{TYPE_LABELS[event.eventType] || event.eventType}</td>
                        <td>
                          <span className={`badge ${STATUS_LABELS[event.registrationStatus]?.cls || 'badge-closed'}`}>
                            {STATUS_LABELS[event.registrationStatus]?.label || event.registrationStatus}
                          </span>
                        </td>
                        <td className="admin-table__capacity">
                          {event.registeredCount ?? 0} / {event.maxCapacity ?? '∞'}
                        </td>
                        <td>
                          <button
                            className={`featured-btn ${event.isFeatured ? 'featured-btn--on' : ''}`}
                            onClick={() => handleToggleFeatured(event)}
                            aria-label={event.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                            id={`toggle-feat-${event.id}`}
                            title={event.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {event.isFeatured ? '⭐' : '☆'}
                          </button>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => openEdit(event)}
                              id={`edit-event-${event.id}`}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => openDelete(event)}
                              id={`delete-event-${event.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FORM VIEW ── */}
        {view === 'form' && (
          <div className="admin-form-wrap">
            <h2 className="admin-form-title">
              {editingEvent ? `Edit Event: ${editingEvent.name}` : 'Create New Event'}
            </h2>

            <form onSubmit={handleSubmit} className="admin-form" noValidate id="admin-event-form">

              {/* Row 1: Name + Category */}
              <div className="admin-form__row admin-form__row--2">
                <div className="form-group">
                  <label htmlFor="admin-name" className="form-label">Event Name <span className="req">*</span></label>
                  <input id="admin-name" type="text" className={`form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Nashik Mahila Udyog Mela 2026"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}/>
                  {formErrors.name && <span className="form-error">⚠ {formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="admin-category" className="form-label">Category</label>
                  <input id="admin-category" type="text" className="form-input"
                    placeholder="e.g. Exhibition, Workshop, Cultural"
                    value={formData.category}
                    onChange={e => setFormData(d => ({ ...d, category: e.target.value }))}/>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="admin-desc" className="form-label">Description <span className="req">*</span></label>
                <textarea id="admin-desc" rows={4} className={`form-input ${formErrors.description ? 'error' : ''}`}
                  placeholder="Describe the event…"
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}/>
                {formErrors.description && <span className="form-error">⚠ {formErrors.description}</span>}
              </div>

              {/* Row 2: Start date + End date */}
              <div className="admin-form__row admin-form__row--2">
                <div className="form-group">
                  <label htmlFor="admin-start-date" className="form-label">Start Date <span className="req">*</span></label>
                  <input
                    id="admin-start-date"
                    type="date"
                    className={`form-input ${formErrors.eventDate ? 'error' : ''}`}
                    min={formData.eventType === 'PAST' ? undefined : todayStr}
                    max={formData.eventType === 'PAST' ? todayStr : undefined}
                    value={formData.eventDate}
                    onChange={e => setFormData(d => ({ ...d, eventDate: e.target.value }))}
                  />
                  {formErrors.eventDate && <span className="form-error">⚠ {formErrors.eventDate}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="admin-end-date" className="form-label">End Date <span className="note">(optional, for multi-day)</span></label>
                  <input
                    id="admin-end-date"
                    type="date"
                    className={`form-input ${formErrors.endDate ? 'error' : ''}`}
                    min={formData.eventDate || (formData.eventType === 'PAST' ? undefined : todayStr)}
                    max={formData.eventType === 'PAST' ? todayStr : undefined}
                    value={formData.endDate}
                    onChange={e => setFormData(d => ({ ...d, endDate: e.target.value }))}
                  />
                  {formErrors.endDate && <span className="form-error">⚠ {formErrors.endDate}</span>}
                </div>
              </div>

              {/* Row 3: Venue + Address */}
              <div className="admin-form__row admin-form__row--2">
                <div className="form-group">
                  <label htmlFor="admin-venue" className="form-label">Venue <span className="req">*</span></label>
                  <input id="admin-venue" type="text" className={`form-input ${formErrors.venue ? 'error' : ''}`}
                    placeholder="e.g. Nashik Municipal Exhibition Ground"
                    value={formData.venue}
                    onChange={e => setFormData(d => ({ ...d, venue: e.target.value }))}/>
                  {formErrors.venue && <span className="form-error">⚠ {formErrors.venue}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="admin-venue-addr" className="form-label">Venue Address</label>
                  <input id="admin-venue-addr" type="text" className="form-input"
                    placeholder="Full address"
                    value={formData.venueAddress}
                    onChange={e => setFormData(d => ({ ...d, venueAddress: e.target.value }))}/>
                </div>
              </div>

              {/* Row 4: Event type + Registration status */}
              <div className="admin-form__row admin-form__row--2">
                <div className="form-group">
                  <label htmlFor="admin-event-type" className="form-label">Event Type <span className="req">*</span></label>
                  <select id="admin-event-type" className="form-input"
                    value={formData.eventType}
                    onChange={e => setFormData(d => ({ ...d, eventType: e.target.value }))}>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="PAST">PAST</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="admin-reg-status" className="form-label">Registration Status <span className="req">*</span></label>
                  <select id="admin-reg-status" className="form-input"
                    value={formData.registrationStatus}
                    onChange={e => setFormData(d => ({ ...d, registrationStatus: e.target.value }))}>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="COMING_SOON">COMING_SOON</option>
                    <option value="NOT_REQUIRED">NOT_REQUIRED</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Capacity */}
              <div className="admin-form__row admin-form__row--3">
                <div className="form-group">
                  <label htmlFor="admin-max-cap" className="form-label">Max Capacity</label>
                  <input id="admin-max-cap" type="number" min="1" className={`form-input ${formErrors.maxCapacity ? 'error' : ''}`}
                    placeholder="e.g. 5000"
                    value={formData.maxCapacity}
                    onChange={e => setFormData(d => ({ ...d, maxCapacity: e.target.value }))}/>
                  {formErrors.maxCapacity && <span className="form-error">⚠ {formErrors.maxCapacity}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="admin-reg-count" className="form-label">Registered Count</label>
                  <input id="admin-reg-count" type="number" min="0" className="form-input"
                    placeholder="e.g. 127"
                    value={formData.registeredCount}
                    onChange={e => setFormData(d => ({ ...d, registeredCount: e.target.value }))}/>
                </div>
                <div className="form-group">
                  <label htmlFor="admin-organizer" className="form-label">Organizer</label>
                  <input id="admin-organizer" type="text" className="form-input"
                    placeholder="Organizer name"
                    value={formData.organizer}
                    onChange={e => setFormData(d => ({ ...d, organizer: e.target.value }))}/>
                </div>
              </div>

              {/* Row 6: Contact */}
              <div className="admin-form__row admin-form__row--2">
                <div className="form-group">
                  <label htmlFor="admin-contact-email" className="form-label">Contact Email</label>
                  <input id="admin-contact-email" type="email" className={`form-input ${formErrors.contactEmail ? 'error' : ''}`}
                    placeholder="info@sakhievents.com"
                    value={formData.contactEmail}
                    onChange={e => setFormData(d => ({ ...d, contactEmail: e.target.value }))}/>
                  {formErrors.contactEmail && <span className="form-error">⚠ {formErrors.contactEmail}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="admin-contact-phone" className="form-label">Contact Phone</label>
                  <input id="admin-contact-phone" type="tel" className={`form-input ${formErrors.contactPhone ? 'error' : ''}`}
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={e => setFormData(d => ({ ...d, contactPhone: e.target.value }))}/>
                  {formErrors.contactPhone && <span className="form-error">⚠ {formErrors.contactPhone}</span>}
                </div>
              </div>

              {/* Row 7: Image URLs */}
              <div className="admin-form__row admin-form__row--2">
                <div className="form-group">
                  <label htmlFor="admin-image-url" className="form-label">Image URL</label>
                  <input id="admin-image-url" type="url" className="form-input"
                    placeholder="https://…/image.jpg"
                    value={formData.imageUrl}
                    onChange={e => setFormData(d => ({ ...d, imageUrl: e.target.value }))}/>
                </div>
                <div className="form-group">
                  <label htmlFor="admin-banner-url" className="form-label">Banner URL</label>
                  <input id="admin-banner-url" type="url" className="form-input"
                    placeholder="https://…/banner.jpg"
                    value={formData.bannerUrl}
                    onChange={e => setFormData(d => ({ ...d, bannerUrl: e.target.value }))}/>
                </div>
              </div>

              {/* Highlights */}
              <div className="form-group">
                <label htmlFor="admin-highlights" className="form-label">
                  Event Highlights <span className="note">(one per line)</span>
                </label>
                <textarea id="admin-highlights" rows={4} className="form-input"
                  placeholder={"200+ women entrepreneur stalls\nLive cooking demonstrations\nCultural performances every weekend"}
                  value={formData.highlights}
                  onChange={e => setFormData(d => ({ ...d, highlights: e.target.value }))}/>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label htmlFor="admin-tags" className="form-label">
                  Tags <span className="note">(comma-separated)</span>
                </label>
                <input id="admin-tags" type="text" className="form-input"
                  placeholder="Exhibition, Women Empowerment, Nashik, Free Entry"
                  value={formData.tags}
                  onChange={e => setFormData(d => ({ ...d, tags: e.target.value }))}/>
              </div>

              {/* Featured checkbox */}
              <div className="admin-form__checkbox">
                <input
                  id="admin-is-featured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={e => setFormData(d => ({ ...d, isFeatured: e.target.checked }))}
                />
                <label htmlFor="admin-is-featured">
                  ⭐ Mark as Featured Event (shows in homepage spotlight)
                </label>
              </div>

              {/* Submit */}
              <div className="admin-form__actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  id="admin-form-submit"
                >
                  {saving ? 'Saving…' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setView('list')}
                  disabled={saving}
                  id="admin-form-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── DELETE CONFIRMATION ── */}
        {view === 'confirm-delete' && deletingEvent && (
          <div className="admin-confirm">
            <div className="admin-confirm__card glass">
              <div className="admin-confirm__icon" aria-hidden="true">🗑️</div>
              <h2>Delete Event?</h2>
              <p>
                You are about to permanently delete:
                <br/>
                <strong>"{deletingEvent.name}"</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-error)', marginTop: '0.5rem' }}>
                ⚠ This action cannot be undone.
              </p>
              <div className="admin-confirm__actions">
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={saving}
                  id="admin-confirm-delete-btn"
                >
                  {saving ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => { setView('list'); setDeletingEvent(null); }}
                  disabled={saving}
                  id="admin-cancel-delete-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

      </div>
    </main>
  );
}
