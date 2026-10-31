import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import './EventDetailPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateRange(start, end) {
  if (!end) return formatDate(start);
  const s = new Date(start), e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} – ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

const statusConfig = {
  OPEN:         { label: 'Registration Open',   cls: 'badge-open',   dot: true  },
  CLOSED:       { label: 'Registration Closed', cls: 'badge-closed', dot: false },
  COMING_SOON:  { label: 'Coming Soon',         cls: 'badge-coming', dot: true  },
  NOT_REQUIRED: { label: 'Free Entry',          cls: 'badge-open',   dot: false },
};

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    setLoading(true);
    eventsApi.getById(id)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxImg(null);
    };
    if (lightboxImg) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxImg]);

  if (loading) return <LoadingSkeleton />;
  if (error)   return <ErrorView message={error} onBack={() => navigate('/events')} />;
  if (!event)  return <ErrorView message="Event not found." onBack={() => navigate('/events')} />;

  const status  = statusConfig[event.registrationStatus] || statusConfig.CLOSED;
  const pct     = event.maxCapacity && event.registeredCount
    ? Math.min(100, Math.round((event.registeredCount / event.maxCapacity) * 100))
    : 0;
  const canReg  = event.registrationStatus === 'OPEN' && !event.registrationFull;
  const isPast  = event.eventType === 'PAST';

  const galleryImages = (event.images || []).filter(Boolean);

  return (
    <main id="event-detail-page" className="event-detail-page page-layout">

      {/* ── Breadcrumb ── */}
      <div className="container breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/events">Events</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{event.name}</span>
      </div>

      {/* ── Hero Banner ── */}
      <section className="event-detail__hero" aria-label={`${event.name} overview`}>
        {/* Background art & subtle ambient illumination */}
        <div className="event-detail__hero-bg" aria-hidden="true">
          <EventHeroArt category={event.category} />
          {event.bannerUrl && (
            <div
              className="event-detail__hero-ambient"
              style={{ backgroundImage: `url(${event.bannerUrl})` }}
            />
          )}
        </div>
        <div className="event-detail__hero-overlay" aria-hidden="true" />

        <div className="container event-detail__hero-inner">
          {/* Main Info Column */}
          <div className="event-detail__hero-content">
            <div className="event-detail__badges">
              <span className={`badge ${status.cls}`}>
                {status.dot && <span className="badge-dot" aria-hidden="true" />}
                {status.label}
              </span>
              {event.isFeatured && (
                <span className="badge badge-featured">
                  ★ Featured
                </span>
              )}
              <span className="badge badge-cat">{event.category || 'Event'}</span>
            </div>

            <h1 className="event-detail__title animate-fade-up">{event.name}</h1>

            <div className="event-detail__hero-meta animate-fade-up delay-100">
              <div className="meta-chip">
                <CalendarIcon />
                <span>{formatDateRange(event.eventDate, event.endDate)}</span>
              </div>
              <div className="meta-chip">
                <LocationIcon />
                <span>{event.venue}</span>
              </div>
              {event.organizer && (
                <div className="meta-chip">
                  <OrganizerIcon />
                  <span>{event.organizer}</span>
                </div>
              )}
            </div>

            {/* CTA on hero */}
            {!isPast && (
              <div className="event-detail__hero-cta animate-fade-up delay-200">
                {canReg ? (
                  <Link
                    to={`/register?eventId=${event.id}`}
                    className="btn btn-primary btn-lg"
                    id="event-detail-register-btn"
                  >
                    Register for This Event →
                  </Link>
                ) : (
                  <button className="btn btn-ghost btn-lg" disabled aria-disabled="true">
                    {event.registrationFull ? 'Event Full' : status.label}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Hero Poster Showcase Card */}
          {event.imageUrl && (
            <div className="event-detail__hero-poster-wrap animate-fade-up delay-100">
              <div
                className="event-detail__hero-poster"
                onClick={() => setLightboxImg(event.imageUrl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setLightboxImg(event.imageUrl)}
                aria-label="View full event poster"
                title="Click to view full image"
              >
                <img
                  src={event.imageUrl}
                  alt={`${event.name} poster`}
                  className="event-detail__hero-poster-img"
                />
                <div className="event-detail__hero-poster-overlay">
                  <span className="poster-preview-pill">
                    <ZoomIcon /> View Poster
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container event-detail__body">
        <div className="event-detail__main">

          {/* Description */}
          <section className="detail-section" aria-labelledby="desc-heading">
            <h2 id="desc-heading" className="detail-section__title">About This Event</h2>
            <p className="detail-section__text">{event.description}</p>
          </section>

          {event.bannerUrl && (
            <section className="event-detail__banner-showcase" aria-label={`${event.name} banner`}>
              <div className="event-detail__banner-frame">
                <img
                  src={event.bannerUrl}
                  alt={`${event.name} event banner`}
                  className="event-detail__banner-image"
                />
              </div>
            </section>
          )}

          {/* Highlights */}
          {event.highlights?.length > 0 && (
            <section className="detail-section" aria-labelledby="highlights-heading">
              <h2 id="highlights-heading" className="detail-section__title">Event Highlights</h2>
              <ul className="highlights-list" role="list">
                {event.highlights.map((h, i) => (
                  <li key={i} className="highlights-list__item animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className="highlights-list__icon" aria-hidden="true">✦</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Gallery Images */}
          {galleryImages.length > 0 && (
            <section className="detail-section" aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="detail-section__title">
                Event Gallery <span className="gallery-count">({galleryImages.length})</span>
              </h2>
              <div className="event-detail__gallery-grid">
                {galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    className="event-detail__gallery-thumb-btn"
                    onClick={() => setLightboxImg(imgUrl)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${event.name} photo ${i + 1}`}
                      className="event-detail__gallery-thumb"
                      loading="lazy"
                    />
                    <div className="gallery-thumb-overlay" aria-hidden="true">
                      <ZoomIcon />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {event.tags?.length > 0 && (
            <section className="detail-section" aria-labelledby="tags-heading">
              <h2 id="tags-heading" className="detail-section__title">Tags</h2>
              <div className="tag-list" role="list">
                {event.tags.map(tag => (
                  <span key={tag} className="badge badge-cat" role="listitem">{tag}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="event-detail__sidebar" aria-label="Event information">

          {/* Registration Status Card */}
          <div className="sidebar-card glass">
            <h3 className="sidebar-card__title">Registration</h3>

            <div className={`badge ${status.cls}`} style={{ marginBottom: '1rem' }}>
              {status.dot && <span className="badge-dot" aria-hidden="true" />}
              {status.label}
            </div>

            {event.maxCapacity && (
              <div className="capacity-section">
                <div className="capacity-row">
                  <span>Registered</span>
                  <strong>{event.registeredCount || 0}</strong>
                </div>
                <div className="capacity-row">
                  <span>Total Capacity</span>
                  <strong>{event.maxCapacity}</strong>
                </div>
                <div className="capacity-bar-wrap">
                  <div className="capacity-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% filled`}>
                    <div className="capacity-bar__fill" style={{ width: `${pct}%` }} data-full={pct >= 100} />
                  </div>
                  <span className="capacity-pct">{pct}% filled</span>
                </div>
                {!isPast && event.spotsLeft > 0 && (
                  <p className="spots-left">
                    <span className="spots-left__num">{event.spotsLeft}</span> spots remaining
                  </p>
                )}
              </div>
            )}

            {!isPast && canReg && (
              <Link
                to={`/register?eventId=${event.id}`}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                id="sidebar-register-btn"
              >
                Register Now
              </Link>
            )}
          </div>

          {/* Event Info Card */}
          <div className="sidebar-card glass">
            <h3 className="sidebar-card__title">Event Details</h3>
            <div className="info-list">
              <div className="info-row">
                <CalendarIcon />
                <div>
                  <span className="info-label">Date</span>
                  <span className="info-value">{formatDateRange(event.eventDate, event.endDate)}</span>
                </div>
              </div>
              <div className="info-row">
                <LocationIcon />
                <div>
                  <span className="info-label">Venue</span>
                  <span className="info-value">{event.venue}</span>
                  {event.venueAddress && <span className="info-sub">{event.venueAddress}</span>}
                </div>
              </div>
              {event.organizer && (
                <div className="info-row">
                  <OrganizerIcon />
                  <div>
                    <span className="info-label">Organizer</span>
                    <span className="info-value">{event.organizer}</span>
                  </div>
                </div>
              )}
              {event.contactPhone && (
                <div className="info-row">
                  <PhoneIcon />
                  <div>
                    <span className="info-label">Contact</span>
                    <a href={`tel:${event.contactPhone}`} className="info-value info-link">{event.contactPhone}</a>
                  </div>
                </div>
              )}
              {event.contactEmail && (
                <div className="info-row">
                  <EmailIcon />
                  <div>
                    <span className="info-label">Email</span>
                    <a href={`mailto:${event.contactEmail}`} className="info-value info-link">{event.contactEmail}</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back to events */}
          <Link to="/events" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} id="back-to-events-btn">
            ← Back to Events
          </Link>
        </aside>
      </div>

      {/* ── Lightbox Modal ── */}
      {lightboxImg && (
        <div
          className="event-detail__lightbox"
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="event-detail__lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={lightboxImg} alt="Enlarged event view" />
            <button
              type="button"
              className="event-detail__lightbox-close"
              onClick={() => setLightboxImg(null)}
              aria-label="Close image preview"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── SVG Icons ── */
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const OrganizerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l1.6-1.6a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ZoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

/* ── Event Hero Art ── */
function EventHeroArt({ category }) {
  const c = (category || '').toLowerCase();
  if (c.includes('exhibition')) return (
    <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
      <rect width="1200" height="500" fill="url(#hero-ex-bg)" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x={80+i*140} y={100+Math.sin(i)*60} width={90} height={200+Math.cos(i)*40} rx="6"
              fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.12)`}
              stroke={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.25)`} strokeWidth="1.5" />
      ))}
      <circle cx="200" cy="80" r="40" fill="rgba(194,24,91,0.15)" stroke="rgba(194,24,91,0.3)" strokeWidth="1.5" />
      <circle cx="900" cy="120" r="60" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5" />
      <defs>
        <linearGradient id="hero-ex-bg" x1="0" y1="0" x2="1200" y2="500">
          <stop offset="0%" stopColor="#1a0a14" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </linearGradient>
      </defs>
    </svg>
  );
  return (
    <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
      <rect width="1200" height="500" fill="url(#hero-def-bg)" />
      {[...Array(20)].map((_,i) => (
        <circle key={i} cx={60*i+30} cy={80+Math.sin(i*0.7)*120} r={15+i%5*8}
                fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},${0.04+i%3*0.03})`} />
      ))}
      <defs>
        <linearGradient id="hero-def-bg" x1="0" y1="0" x2="1200" y2="500">
          <stop offset="0%" stopColor="#150a1a" />
          <stop offset="100%" stopColor="#0a0a10" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Skeletons / Error ── */
function LoadingSkeleton() {
  return (
    <div className="page-layout" style={{ paddingTop: '5rem' }} aria-busy="true" aria-label="Loading event details">
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="skeleton" style={{ height: 380, borderRadius: 20 }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'2rem', marginTop:'2rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {[100, 60, 80, 40, 100, 60].map((h,i) => (
              <div key={i} className="skeleton" style={{ height: h }} />
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {[200, 250].map((h,i) => (
              <div key={i} className="skeleton" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorView({ message, onBack }) {
  return (
    <div className="page-layout" style={{ paddingTop: '8rem', textAlign:'center' }}>
      <div className="container">
        <p style={{ fontSize:'4rem' }}>😕</p>
        <h2 style={{ fontFamily:'var(--font-display)', marginBottom:'1rem' }}>Event Not Found</h2>
        <p style={{ marginBottom:'2rem' }}>{message}</p>
        <button className="btn btn-primary" onClick={onBack}>← Back to Events</button>
      </div>
    </div>
  );
}
