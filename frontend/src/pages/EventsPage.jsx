import { useState, useEffect } from 'react';
import { eventsApi } from '../api/eventsApi';
import EventCard from '../components/EventCard';
import './EventsPage.css';

const TABS = [
  { key: 'all',      label: 'All Events'       },
  { key: 'upcoming', label: 'Upcoming'          },
  { key: 'past',     label: 'Past Events'       },
];

const CATEGORIES = ['All', 'Exhibition', 'Workshop', 'Cultural', 'Cultural Festival', 'Festival'];

export default function EventsPage() {
  const [events, setEvents]           = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [activeTab, setActiveTab]     = useState('all');
  const [activeCategory, setCategory] = useState('All');
  const [searchQuery, setSearch]      = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searching, setSearching]     = useState(false);

  // Load events on tab change
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSearch('');

    const fetchFn = activeTab === 'upcoming' ? eventsApi.getUpcoming
                  : activeTab === 'past'     ? eventsApi.getPast
                  : eventsApi.getAll;

    fetchFn()
      .then(data => { setEvents(data); setFiltered(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Category filter
  useEffect(() => {
    if (!searchQuery) {
      const filtered = activeCategory === 'All'
        ? events
        : events.filter(e => e.category?.toLowerCase() === activeCategory.toLowerCase());
      setFiltered(filtered);
    }
  }, [activeCategory, events, searchQuery]);

  // Search
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);

    if (!q.trim()) {
      setFiltered(activeCategory === 'All' ? events : events.filter(e => e.category?.toLowerCase() === activeCategory.toLowerCase()));
      return;
    }

    setSearching(true);
    try {
      const results = await eventsApi.search(q);
      setFiltered(results);
    } catch {
      setFiltered(events.filter(e =>
        e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.description.toLowerCase().includes(q.toLowerCase())
      ));
    } finally {
      setSearching(false);
    }
  };

  return (
    <main id="events-page" className="events-page page-layout">
      {/* ── Page Header ── */}
      <header className="page-hero" aria-labelledby="events-page-title">
        <div className="page-hero__bg" aria-hidden="true"/>
        <div className="container page-hero__content">
          <span className="section-label">Shree Sakhi Events</span>
          <h1 id="events-page-title">
            Our <span className="text-gradient">Events</span>
          </h1>
          <p>Discover our past celebrations and upcoming experiences — crafted with passion for Nashik's community</p>
        </div>
      </header>

      <div className="container events-page__body">

        {/* ── Controls ── */}
        <div className="events-controls">
          {/* Tab Switcher */}
          <div className="events-tabs" role="tablist" aria-label="Filter events by time">
            {TABS.map(tab => (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`events-tab ${activeTab === tab.key ? 'events-tab--active' : ''}`}
                onClick={() => { setActiveTab(tab.key); setCategory('All'); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="events-search">
            <svg className="events-search__icon" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="events-search-input"
              type="search"
              className="form-input events-search__input"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search events by name or description"
            />
            {searching && <span className="events-search__spinner spinner" style={{ width:18, height:18, borderWidth:2 }}/>}
          </div>
        </div>

        {/* ── Category Pills ── */}
        {!searchQuery && (
          <div className="category-pills" role="group" aria-label="Filter by category">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase().replace(/\s+/g,'-')}`}
                className={`category-pill ${activeCategory === cat ? 'category-pill--active' : ''}`}
                onClick={() => setCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Count ── */}
        {!loading && !error && (
          <p className="events-count" aria-live="polite">
            {searchQuery
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"`
              : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="events-grid-wrapper" aria-busy="true" aria-label="Loading events">
            <div className="events-grid events-grid--3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton event-skeleton"/>)}
            </div>
          </div>
        ) : error ? (
          <div className="error-banner" role="alert">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>Unable to load events</strong>
              <p>{error}</p>
              <p style={{ fontSize: '0.82rem', opacity: 0.6 }}>Ensure Spring Boot backend is running on <code>http://localhost:8080</code></p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-events">
            <span className="no-events__icon" aria-hidden="true">🎪</span>
            <h3>No events found</h3>
            <p>Try changing the filter or search query.</p>
          </div>
        ) : (
          <div className="events-grid events-grid--3" role="list" aria-label="Events list">
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
    </main>
  );
}
