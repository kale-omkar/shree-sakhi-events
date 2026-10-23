import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import EventCard from '../components/EventCard';
import './UpcomingEventsPage.css';

const CATEGORIES = ['All', 'Exhibition', 'Workshop', 'Cultural', 'Cultural Festival'];

export default function UpcomingEventsPage() {
  const [events, setEvents]       = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [sortBy, setSortBy]       = useState('date'); // 'date' | 'name' | 'capacity'
  const sectionRef = useRef(null);

  useEffect(() => {
    eventsApi.getUpcoming()
      .then(data => { setEvents(data); setFiltered(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter + sort
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

    if (sortBy === 'date')
      result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    else if (sortBy === 'name')
      result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'capacity')
      result.sort((a, b) => (b.spotsLeft ?? 0) - (a.spotsLeft ?? 0));

    setFiltered(result);
  }, [search, category, sortBy, events]);

  const featuredEvents  = events.filter(e => e.isFeatured);
  const openRegEvents   = events.filter(e => e.registrationStatus === 'OPEN');

  return (
    <main id="upcoming-events-page" className="upcoming-page page-layout">

      {/* ── HERO ── */}
      <header className="upcoming-hero" aria-label="Upcoming Events">
        <div className="upcoming-hero__bg" aria-hidden="true">
          <div className="upcoming-hero__orb upcoming-hero__orb--pink" />
          <div className="upcoming-hero__orb upcoming-hero__orb--gold" />
          <div className="upcoming-hero__grid" />
        </div>

        <div className="container upcoming-hero__content">
          <span className="section-label animate-fade-up">Mark Your Calendar</span>
          <h1 className="animate-fade-up delay-100">
            Upcoming <span className="text-gradient">Events</span>
          </h1>
          <p className="upcoming-hero__subtitle animate-fade-up delay-200">
            Don't miss Nashik's most vibrant celebrations. Secure your spot before they fill up!
          </p>

          {/* Quick stats */}
          {!loading && !error && (
            <div className="upcoming-hero__stats animate-fade-up delay-300" role="list">
              <div className="upcoming-hero__stat" role="listitem">
                <span className="upcoming-hero__stat-num">{events.length}</span>
                <span className="upcoming-hero__stat-label">Events Coming</span>
              </div>
              <div className="upcoming-hero__stat" role="listitem">
                <span className="upcoming-hero__stat-num">{openRegEvents.length}</span>
                <span className="upcoming-hero__stat-label">Open Registration</span>
              </div>
              <div className="upcoming-hero__stat" role="listitem">
                <span className="upcoming-hero__stat-num">{featuredEvents.length}</span>
                <span className="upcoming-hero__stat-label">Featured Events</span>
              </div>
            </div>
          )}

          <div className="upcoming-hero__badges animate-fade-up delay-400">
            <span className="up-badge up-badge--green">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Registrations Open
            </span>
            <span className="up-badge up-badge--gold">🎟️ Free Entry Available</span>
            <span className="up-badge">📍 Nashik &amp; Beyond</span>
          </div>

          <div className="upcoming-hero__cta animate-fade-up delay-500">
            <a
              href="#events-grid"
              className="btn btn-primary btn-lg"
              id="upcoming-browse-btn"
              onClick={e => { e.preventDefault(); sectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Browse Events ↓
            </a>
          </div>
        </div>
      </header>

      {/* ── FEATURED SPOTLIGHT ── */}
      {!loading && !error && featuredEvents.length > 0 && (
        <section className="upcoming-featured" aria-labelledby="featured-upcoming-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Spotlight</span>
              <h2 id="featured-upcoming-heading">
                Featured <span className="text-gradient">Upcoming Events</span>
              </h2>
            </div>
            <div className={`upcoming-featured__grid upcoming-featured__grid--${Math.min(featuredEvents.length, 2)}`}>
              {featuredEvents.map((event, i) => (
                <div key={event.id} className={`animate-fade-up delay-${(i + 1) * 100}`}>
                  <EventCard event={event} featured={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL EVENTS GRID ── */}
      <section
        id="events-grid"
        className="upcoming-grid-section"
        ref={sectionRef}
        aria-labelledby="all-upcoming-heading"
      >
        <div className="container">
          <div className="section-header">
            <span className="section-label">All Upcoming</span>
            <h2 id="all-upcoming-heading">
              All <span className="text-gradient">Events</span>
            </h2>
          </div>

          {/* Controls Bar */}
          <div className="upcoming-controls" role="search" aria-label="Filter and search events">

            {/* Search */}
            <div className="upcoming-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" aria-hidden="true" className="upcoming-search__icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="upcoming-search-input"
                type="search"
                placeholder="Search events…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input upcoming-search__input"
                aria-label="Search events by name, description or venue"
              />
            </div>

            {/* Sort */}
            <div className="upcoming-sort">
              <label htmlFor="upcoming-sort-select" className="sr-only">Sort by</label>
              <select
                id="upcoming-sort-select"
                className="form-input upcoming-sort__select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="date">Sort: Date ↑</option>
                <option value="name">Sort: Name A–Z</option>
                <option value="capacity">Sort: Spots Left</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="upcoming-cats" role="group" aria-label="Filter by category">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                id={`upcoming-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`cat-pill ${category === cat ? 'cat-pill--active' : ''}`}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Result count */}
          {!loading && !error && (
            <p className="upcoming-count" aria-live="polite">
              {filtered.length === 0
                ? 'No events match your filters'
                : `Showing ${filtered.length} of ${events.length} event${events.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="upcoming-events-grid" aria-busy="true" aria-label="Loading upcoming events">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton event-skeleton" />)}
            </div>
          ) : error ? (
            <ErrorBanner message={error} />
          ) : filtered.length === 0 ? (
            <UpcomingEmpty hasFilters={!!(search || category !== 'All')} />
          ) : (
            <div className="upcoming-events-grid" role="list" aria-label="Upcoming events">
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

      {/* ── LINK TO PAST ── */}
      {!loading && !error && (
        <div className="upcoming-alt-section">
          <div className="container upcoming-alt-inner">
            <div className="upcoming-alt-text">
              <span style={{ fontSize: '2.5rem' }}>📸</span>
              <div>
                <h3>Want to see what we've done before?</h3>
                <p>Explore our portfolio of past events, exhibitions and festivals.</p>
              </div>
            </div>
            <Link to="/past-events" className="btn btn-outline" id="upcoming-to-past-link">
              Past Events &amp; Portfolio →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="upcoming-error" role="alert">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <strong>Unable to load events</strong>
        <p>{message}</p>
        <p style={{ fontSize: '0.82rem', opacity: 0.6 }}>
          Ensure Spring Boot backend is running on <code>http://localhost:8080</code>
        </p>
      </div>
    </div>
  );
}

function UpcomingEmpty({ hasFilters }) {
  return (
    <div className="upcoming-empty">
      <span className="upcoming-empty__icon" aria-hidden="true">{hasFilters ? '🔍' : '📅'}</span>
      <h3>{hasFilters ? 'No events match your filters' : 'No upcoming events yet'}</h3>
      <p>
        {hasFilters
          ? 'Try clearing your search or selecting a different category.'
          : 'Check back soon — exciting events are being planned!'}
      </p>
      {hasFilters && (
        <Link to="/events" className="btn btn-outline btn-sm">View All Events</Link>
      )}
    </div>
  );
}
