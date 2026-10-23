import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import EventCard from '../components/EventCard';
import EventGallery from '../components/EventGallery';
import './PastEventsPage.css';

const CATEGORIES = ['All', 'Exhibition', 'Cultural', 'Cultural Festival', 'Workshop'];
const VIEW_MODES = [
  { key: 'grid',     icon: <GridIcon />,     label: 'Grid'     },
  { key: 'timeline', icon: <TimelineIcon />, label: 'Timeline' },
  { key: 'gallery',  icon: <GalleryIcon />,  label: 'Gallery'  },
];

export default function PastEventsPage() {
  const [events, setEvents]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy]     = useState('date-desc');
  const [lightboxEvent, setLightboxEvent] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    eventsApi.getPast()
      .then(data => { setEvents(data); setFiltered(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...events];
    if (category !== 'All')
      result = result.filter(e => e.category?.toLowerCase().includes(category.toLowerCase()));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'date-desc') result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    else if (sortBy === 'date-asc') result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'attendees') result.sort((a, b) => (b.registeredCount ?? 0) - (a.registeredCount ?? 0));
    setFiltered(result);
  }, [search, category, sortBy, events]);

  const totalAttendees = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
  const categories     = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  return (
    <main id="past-events-page" className="past-page page-layout">

      {/* ── HERO ── */}
      <header className="past-hero" aria-label="Past Events and Portfolio">
        <div className="past-hero__bg" aria-hidden="true">
          <div className="past-hero__orb past-hero__orb--gold1" />
          <div className="past-hero__orb past-hero__orb--gold2" />
          <div className="past-hero__grid" />
        </div>

        <div className="container past-hero__content">
          <span className="section-label animate-fade-up">Our Legacy</span>
          <h1 className="animate-fade-up delay-100">
            Past Events &amp; <span className="text-gradient">Portfolio</span>
          </h1>
          <p className="past-hero__subtitle animate-fade-up delay-200">
            Relive the magic — every exhibition, festival and workshop that made Nashik's women shine.
          </p>

          {/* Stats */}
          {!loading && !error && (
            <div className="past-hero__stats animate-fade-up delay-300" role="list">
              <div className="past-hero__stat" role="listitem">
                <span className="past-hero__stat-num">{events.length}+</span>
                <span className="past-hero__stat-label">Events Completed</span>
              </div>
              <div className="past-hero__stat" role="listitem">
                <span className="past-hero__stat-num">
                  {totalAttendees >= 1000 ? `${(totalAttendees / 1000).toFixed(0)}K+` : totalAttendees}
                </span>
                <span className="past-hero__stat-label">Total Attendees</span>
              </div>
              <div className="past-hero__stat" role="listitem">
                <span className="past-hero__stat-num">6+</span>
                <span className="past-hero__stat-label">Years of Events</span>
              </div>
              <div className="past-hero__stat" role="listitem">
                <span className="past-hero__stat-num">100%</span>
                <span className="past-hero__stat-label">Success Rate</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── PHOTO GALLERY SECTION ── */}
      {!loading && !error && events.length > 0 && (
        <section className="past-gallery-section" aria-labelledby="gallery-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Photo Gallery</span>
              <h2 id="gallery-heading">
                Moments to <span className="text-gradient">Remember</span>
              </h2>
              <p>Glimpses from our most memorable events</p>
            </div>
            <EventGallery events={events} onEventClick={setLightboxEvent} />
          </div>
        </section>
      )}

      {/* ── EVENT BROWSER ── */}
      <section
        className="past-browser"
        aria-labelledby="past-events-heading"
        ref={sectionRef}
      >
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse All</span>
            <h2 id="past-events-heading">
              Event <span className="text-gradient">Archive</span>
            </h2>
          </div>

          {/* Controls */}
          <div className="past-controls">
            {/* Search */}
            <div className="past-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" aria-hidden="true" className="past-search__icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="past-search-input"
                type="search"
                placeholder="Search past events…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input past-search__input"
                aria-label="Search past events"
              />
            </div>

            {/* Sort */}
            <select
              id="past-sort-select"
              className="form-input past-sort__select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort past events"
            >
              <option value="date-desc">Most Recent</option>
              <option value="date-asc">Oldest First</option>
              <option value="name">Name A–Z</option>
              <option value="attendees">Most Attended</option>
            </select>

            {/* View mode toggle */}
            <div className="past-view-toggle" role="group" aria-label="View mode">
              {VIEW_MODES.map(vm => (
                <button
                  key={vm.key}
                  id={`past-view-${vm.key}`}
                  className={`view-btn ${viewMode === vm.key ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode(vm.key)}
                  aria-pressed={viewMode === vm.key}
                  title={`${vm.label} view`}
                >
                  {vm.icon}
                  <span className="sr-only">{vm.label} view</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div className="past-cats" role="group" aria-label="Filter by category">
            {categories.map(cat => (
              <button
                key={cat}
                id={`past-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`cat-pill ${category === cat ? 'cat-pill--active' : ''}`}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Count */}
          {!loading && !error && (
            <p className="past-count" aria-live="polite">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </p>
          )}

          {/* Content */}
          {loading ? (
            <div className="past-events-grid" aria-busy="true">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton event-skeleton" />)}
            </div>
          ) : error ? (
            <ErrorBanner message={error} />
          ) : filtered.length === 0 ? (
            <PastEmpty hasFilters={!!(search || category !== 'All')} />
          ) : viewMode === 'timeline' ? (
            <TimelineView events={filtered} />
          ) : viewMode === 'gallery' ? (
            <EventGallery events={filtered} onEventClick={setLightboxEvent} compact={false} />
          ) : (
            <div className="past-events-grid" role="list" aria-label="Past events">
              {filtered.map((event, i) => (
                <div key={event.id}
                     className={`animate-fade-up delay-${Math.min((i % 6 + 1) * 100, 600)}`}
                     role="listitem">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── LINK TO UPCOMING ── */}
      {!loading && !error && (
        <div className="past-alt-section">
          <div className="container past-alt-inner">
            <div>
              <h3>Ready for new memories?</h3>
              <p>Check out our upcoming events and be part of the next Shree Sakhi celebration.</p>
            </div>
            <Link to="/upcoming-events" className="btn btn-primary" id="past-to-upcoming-link">
              View Upcoming Events →
            </Link>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxEvent && (
        <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
      )}
    </main>
  );
}

/* ── Timeline View ── */
function TimelineView({ events }) {
  return (
    <div className="past-timeline" role="list" aria-label="Past events timeline">
      {events.map((event, i) => (
        <div key={event.id}
             className={`past-timeline__item animate-fade-up delay-${Math.min((i % 6 + 1) * 100, 600)}`}
             role="listitem">
          <div className="past-timeline__marker" aria-hidden="true">
            <div className="past-timeline__dot" />
            {i < events.length - 1 && <div className="past-timeline__line" />}
          </div>

          <div className="past-timeline__card card">
            <div className="past-timeline__meta">
              <span className="badge badge-past">{event.category || 'Event'}</span>
              <time dateTime={event.eventDate} className="past-timeline__date">
                {new Date(event.eventDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </time>
            </div>
            <h3 className="past-timeline__title">
              <Link to={`/events/${event.id}`}>{event.name}</Link>
            </h3>
            <p className="past-timeline__venue">📍 {event.venue}</p>
            <p className="past-timeline__desc">
              {event.description?.substring(0, 180)}
              {event.description?.length > 180 ? '…' : ''}
            </p>
            {event.highlights?.length > 0 && (
              <ul className="past-timeline__highlights">
                {event.highlights.slice(0, 3).map((h, j) => (
                  <li key={j}><span aria-hidden="true">✦</span> {h}</li>
                ))}
              </ul>
            )}
            <div className="past-timeline__footer">
              {event.registeredCount && (
                <span className="past-timeline__attendees">
                  👥 {event.registeredCount.toLocaleString('en-IN')} attendees
                </span>
              )}
              <Link to={`/events/${event.id}`} className="btn btn-ghost btn-sm"
                    id={`timeline-detail-${event.id}`}>
                View Details →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Lightbox ── */
function EventLightbox({ event, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Details for ${event.name}`}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lightbox__inner">
        <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox" id="lightbox-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="lightbox__art" aria-hidden="true">
          <LightboxArt category={event.category} />
        </div>

        <div className="lightbox__body">
          <div className="lightbox__badges">
            <span className="badge badge-past">{event.category || 'Event'}</span>
          </div>
          <h2 className="lightbox__title">{event.name}</h2>
          <div className="lightbox__meta">
            <span>📅 {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>📍 {event.venue}</span>
            {event.registeredCount && <span>👥 {event.registeredCount.toLocaleString('en-IN')} attendees</span>}
          </div>
          <p className="lightbox__desc">{event.description}</p>
          {event.highlights?.length > 0 && (
            <ul className="lightbox__highlights">
              {event.highlights.map((h, i) => (
                <li key={i}><span aria-hidden="true">✦</span> {h}</li>
              ))}
            </ul>
          )}
          <div className="lightbox__actions">
            <Link to={`/events/${event.id}`} className="btn btn-primary" id={`lightbox-view-${event.id}`}
                  onClick={onClose}>
              View Full Details →
            </Link>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helpers */
function ErrorBanner({ message }) {
  return (
    <div className="past-error" role="alert">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <strong>Unable to load past events</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

function PastEmpty({ hasFilters }) {
  return (
    <div className="past-empty">
      <span aria-hidden="true">{hasFilters ? '🔍' : '📚'}</span>
      <h3>{hasFilters ? 'No events match your filters' : 'No past events recorded yet'}</h3>
      <p>{hasFilters ? 'Try clearing your filters.' : 'Past events will appear here once the event data is added.'}</p>
    </div>
  );
}

/* SVG icons */
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function TimelineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="3" cy="18" r="1.5"/>
    </svg>
  );
}
function GalleryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );
}

function LightboxArt({ category }) {
  const c = (category || '').toLowerCase();
  const color1 = c.includes('exhibition') ? '194,24,91' : '245,158,11';
  const color2 = c.includes('cultural') ? '194,24,91' : '245,158,11';
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"
         style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="200" fill="url(#lb-bg)"/>
      {[0,1,2,3,4,5,6].map(i => (
        <circle key={i} cx={30 + i * 55} cy={100 + Math.sin(i * 0.9) * 50} r={20 + i % 3 * 12}
                fill={`rgba(${i % 2 === 0 ? color1 : color2},${0.08 + i % 3 * 0.04})`}/>
      ))}
      <defs>
        <linearGradient id="lb-bg" x1="0" y1="0" x2="400" y2="200">
          <stop offset="0%" stopColor="#1a1a26"/>
          <stop offset="100%" stopColor="#0a0a0f"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
