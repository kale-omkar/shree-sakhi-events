import { Link } from 'react-router-dom';
import './EventCard.css';

// Returns icon for registration status badge
const statusConfig = {
  OPEN:         { label: 'Registration Open',  cls: 'badge-open',   dot: true  },
  CLOSED:       { label: 'Registration Closed', cls: 'badge-closed', dot: false },
  COMING_SOON:  { label: 'Coming Soon',         cls: 'badge-coming', dot: true  },
  NOT_REQUIRED: { label: 'Free Entry',          cls: 'badge-open',   dot: false },
};

const typeLabel = { UPCOMING: 'Upcoming', ONGOING: 'Ongoing', PAST: 'Past Event' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateRange(start, end) {
  if (!end) return formatDate(start);
  const s = new Date(start);
  const e = new Date(end);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function capacityPercent(reg, max) {
  if (!max || !reg) return 0;
  return Math.min(100, Math.round((reg / max) * 100));
}

export default function EventCard({ event, featured = false }) {
  const status = statusConfig[event.registrationStatus] || statusConfig.CLOSED;
  const pct    = capacityPercent(event.registeredCount, event.maxCapacity);
  const isPast = event.eventType === 'PAST';

  return (
    <article className={`event-card card ${featured ? 'event-card--featured' : ''} ${isPast ? 'event-card--past' : ''}`}
             aria-label={`Event: ${event.name}`}>

      {/* Image Section */}
      <div className="event-card__image-wrap">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} className="event-card__image" loading="lazy" />
        ) : (
          <div className="event-card__image-placeholder" aria-hidden="true">
            <EventPlaceholderArt category={event.category} />
          </div>
        )}

        {/* Overlay badges */}
        <div className="event-card__overlay">
          <span className={`badge badge-cat`}>{event.category || 'Event'}</span>
          {featured && (
            <span className="event-card__featured-tag" aria-label="Featured event">
              ★ Featured
            </span>
          )}
        </div>

        {/* Type tag */}
        <div className="event-card__type-tag">
          {typeLabel[event.eventType] || event.eventType}
        </div>
      </div>

      {/* Content */}
      <div className="event-card__body">
        {/* Status */}
        <div className="event-card__status">
          <span className={`badge ${status.cls}`}>
            {status.dot && <span className="badge-dot" aria-hidden="true"/>}
            {status.label}
          </span>
        </div>

        {/* Name */}
        <h3 className="event-card__name">{event.name}</h3>

        {/* Description */}
        <p className="event-card__desc">{event.description}</p>

        {/* Meta */}
        <div className="event-card__meta">
          <div className="event-card__meta-item" title="Date">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{formatDateRange(event.eventDate, event.endDate)}</span>
          </div>
          <div className="event-card__meta-item" title="Venue">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Capacity bar */}
        {event.maxCapacity && !isPast && (
          <div className="event-card__capacity">
            <div className="event-card__capacity-info">
              <span>{event.registeredCount || 0} registered</span>
              <span>{event.spotsLeft > 0 ? `${event.spotsLeft} spots left` : 'Full'}</span>
            </div>
            <div className="event-card__capacity-bar" role="progressbar"
                 aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                 aria-label={`${pct}% capacity filled`}>
              <div className="event-card__capacity-fill" style={{ width: `${pct}%` }}
                   data-full={pct >= 100}/>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="event-card__actions">
          <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm" aria-label={`View details of ${event.name}`}>
            View Details
          </Link>
          {!isPast && event.registrationStatus === 'OPEN' && (
            <Link to={`/register?eventId=${event.id}`} className="btn btn-primary btn-sm" aria-label={`Register for ${event.name}`}>
              Register →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// SVG placeholder art by category
function EventPlaceholderArt({ category }) {
  const c = (category || '').toLowerCase();

  if (c.includes('exhibition')) return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="url(#ex-bg)"/>
      <rect x="30" y="40" width="50" height="70" rx="4" fill="rgba(194,24,91,0.3)" stroke="rgba(194,24,91,0.6)" strokeWidth="1.5"/>
      <rect x="90" y="55" width="40" height="55" rx="4" fill="rgba(245,158,11,0.25)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5"/>
      <rect x="140" y="30" width="35" height="80" rx="4" fill="rgba(233,30,140,0.2)" stroke="rgba(233,30,140,0.4)" strokeWidth="1.5"/>
      <circle cx="55" cy="25" r="8" fill="rgba(194,24,91,0.5)"/>
      <circle cx="110" cy="38" r="6" fill="rgba(245,158,11,0.5)"/>
      <defs><linearGradient id="ex-bg" x1="0" y1="0" x2="200" y2="140"><stop stopColor="#1a1a26"/><stop offset="1" stopColor="#0a0a0f"/></linearGradient></defs>
    </svg>
  );

  if (c.includes('cultural') || c.includes('festival')) return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="url(#cf-bg)"/>
      <ellipse cx="100" cy="80" rx="50" ry="45" fill="rgba(194,24,91,0.15)" stroke="rgba(194,24,91,0.4)" strokeWidth="1.5"/>
      <ellipse cx="100" cy="80" rx="30" ry="28" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5"/>
      <circle cx="100" cy="80" r="12" fill="rgba(233,30,140,0.4)"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1="100" y1="80"
          x2={100+60*Math.cos(a*Math.PI/180)}
          y2={80+60*Math.sin(a*Math.PI/180)}
          stroke="rgba(245,158,11,0.25)" strokeWidth="1"/>
      ))}
      <defs><linearGradient id="cf-bg" x1="0" y1="0" x2="200" y2="140"><stop stopColor="#1a1a26"/><stop offset="1" stopColor="#0a0a0f"/></linearGradient></defs>
    </svg>
  );

  if (c.includes('workshop')) return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="url(#ws-bg)"/>
      <rect x="20" y="50" width="160" height="5" rx="2.5" fill="rgba(194,24,91,0.3)"/>
      <rect x="40" y="65" width="120" height="5" rx="2.5" fill="rgba(245,158,11,0.3)"/>
      <rect x="60" y="80" width="80" height="5" rx="2.5" fill="rgba(194,24,91,0.2)"/>
      <circle cx="100" cy="35" r="18" fill="rgba(194,24,91,0.2)" stroke="rgba(194,24,91,0.5)" strokeWidth="2"/>
      <text x="100" y="41" textAnchor="middle" fill="rgba(194,24,91,0.8)" fontSize="16">💡</text>
      <defs><linearGradient id="ws-bg" x1="0" y1="0" x2="200" y2="140"><stop stopColor="#1a1a26"/><stop offset="1" stopColor="#0a0a0f"/></linearGradient></defs>
    </svg>
  );

  // Default generic event art
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="url(#dft-bg)"/>
      <circle cx="100" cy="60" r="35" fill="rgba(194,24,91,0.15)" stroke="rgba(194,24,91,0.35)" strokeWidth="1.5"/>
      <path d="M85 55 L100 40 L115 55 L115 75 L85 75 Z" fill="rgba(245,158,11,0.4)"/>
      <circle cx="100" cy="60" r="10" fill="rgba(194,24,91,0.6)"/>
      <defs><linearGradient id="dft-bg" x1="0" y1="0" x2="200" y2="140"><stop stopColor="#1a1a26"/><stop offset="1" stopColor="#0a0a0f"/></linearGradient></defs>
    </svg>
  );
}
