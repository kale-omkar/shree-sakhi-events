import { useState } from 'react';
import { Link } from 'react-router-dom';
import './EventGallery.css';

/**
 * EventGallery
 * Renders a masonry-style photo gallery grid for a list of events.
 * Each card shows the event art, name, date and a link to its detail page.
 *
 * Props:
 *  - events:        Array of event objects from the API
 *  - onEventClick:  Called with the event when a card is clicked (opens lightbox)
 *  - compact:       If true, shows a 4-column preview strip (used in the hero area)
 */
export default function EventGallery({ events = [], onEventClick, compact = true }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Pick events that have images first, then pad with placeholder art events
  const displayEvents = compact ? events.slice(0, 8) : events;

  if (displayEvents.length === 0) return null;

  return (
    <div className={`event-gallery ${compact ? 'event-gallery--compact' : 'event-gallery--full'}`}
         aria-label="Event photo gallery">
      {displayEvents.map((event, i) => (
        <GalleryCard
          key={event.id}
          event={event}
          index={i}
          hovered={hoveredId === event.id}
          onHover={setHoveredId}
          onClick={onEventClick}
          featured={i === 0 || i === 3} // span first and fourth cards wider
        />
      ))}
    </div>
  );
}

function GalleryCard({ event, index, hovered, onHover, onClick, featured }) {
  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  return (
    <article
      className={`gallery-card ${featured ? 'gallery-card--wide' : ''}`}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`Gallery: ${event.name}`}
    >
      {/* Image / Art */}
      <div className="gallery-card__image">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="gallery-card__img"
            loading="lazy"
          />
        ) : (
          <GalleryPlaceholderArt category={event.category} index={index} />
        )}

        {/* Hover overlay */}
        <div className={`gallery-card__overlay ${hovered ? 'gallery-card__overlay--visible' : ''}`}>
          <div className="gallery-card__overlay-content">
            <h3 className="gallery-card__title">{event.name}</h3>
            <p className="gallery-card__date">
              📅 {formatDate(event.eventDate)}
              {event.endDate && event.endDate !== event.eventDate
                ? ` – ${formatDate(event.endDate)}`
                : ''}
            </p>
            <p className="gallery-card__venue">📍 {event.venue}</p>
            {event.registeredCount && (
              <p className="gallery-card__attendees">
                👥 {event.registeredCount.toLocaleString('en-IN')} attendees
              </p>
            )}
            <div className="gallery-card__actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onClick && onClick(event)}
                id={`gallery-preview-${event.id}`}
                aria-label={`Quick view ${event.name}`}
              >
                Quick View
              </button>
              <Link
                to={`/events/${event.id}`}
                className="btn btn-ghost btn-sm"
                id={`gallery-detail-${event.id}`}
              >
                Full Details
              </Link>
            </div>
          </div>
        </div>

        {/* Category badge (always visible) */}
        <div className="gallery-card__badge">
          <span className="badge badge-cat">{event.category || 'Event'}</span>
        </div>
      </div>

      {/* Footer info strip */}
      <div className="gallery-card__footer">
        <p className="gallery-card__footer-name">{event.name}</p>
        <span className="gallery-card__footer-date">{formatDate(event.eventDate)}</span>
      </div>
    </article>
  );
}

/* ── Placeholder art per category ── */
function GalleryPlaceholderArt({ category, index }) {
  const c = (category || '').toLowerCase();
  const colors = [
    ['194,24,91', '245,158,11'],
    ['245,158,11', '233,30,140'],
    ['233,30,140', '194,24,91'],
    ['136,14,79',  '245,158,11'],
  ][index % 4];

  if (c.includes('exhibition')) {
    return (
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg"
           style={{ width: '100%', height: '100%' }} aria-hidden="true">
        <rect width="400" height="260" fill="url(#gal-ex-bg)"/>
        {[0,1,2,3,4].map(i => (
          <g key={i} transform={`translate(${40 + i * 68}, 60)`}>
            <rect width="52" height="110" rx="4"
                  fill={`rgba(${i%2===0?colors[0]:colors[1]},0.18)`}
                  stroke={`rgba(${i%2===0?colors[0]:colors[1]},0.4)`} strokeWidth="1.5"/>
            <rect x="6" y="6" width="40" height="30" rx="2"
                  fill={`rgba(${i%2===0?colors[0]:colors[1]},0.25)`}/>
          </g>
        ))}
        <rect x="30" y="175" width="340" height="3" rx="1.5" fill={`rgba(${colors[0]},0.3)`}/>
        {/* Bunting */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <polygon key={i} points={`${30+i*48},20 ${54+i*48},42 ${6+i*48},42`}
                   fill={`rgba(${i%2===0?colors[0]:colors[1]},0.4)`}/>
        ))}
        <line x1="20" y1="20" x2="380" y2="20" stroke={`rgba(${colors[0]},0.35)`} strokeWidth="1.5"/>
        <defs>
          <linearGradient id="gal-ex-bg" x1="0" y1="0" x2="400" y2="260">
            <stop offset="0%" stopColor="#1a1228"/>
            <stop offset="100%" stopColor="#0a0a0f"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (c.includes('cultural') || c.includes('festival')) {
    return (
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg"
           style={{ width: '100%', height: '100%' }} aria-hidden="true">
        <rect width="400" height="260" fill="url(#gal-cf-bg)"/>
        <ellipse cx="200" cy="140" rx="110" ry="100" fill={`rgba(${colors[0]},0.08)`} stroke={`rgba(${colors[0]},0.25)`} strokeWidth="2"/>
        <ellipse cx="200" cy="140" rx="70" ry="64" fill={`rgba(${colors[1]},0.1)`} stroke={`rgba(${colors[1]},0.3)`} strokeWidth="1.5"/>
        <circle cx="200" cy="140" r="28" fill={`rgba(${colors[0]},0.3)`} stroke={`rgba(${colors[0]},0.6)`} strokeWidth="2"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
          const r = 90;
          const x = 200 + r * Math.cos(a * Math.PI / 180);
          const y = 140 + r * Math.sin(a * Math.PI / 180);
          return <circle key={i} cx={x} cy={y} r="6" fill={`rgba(${i%2===0?colors[0]:colors[1]},0.5)`}/>;
        })}
        <text x="200" y="150" textAnchor="middle" fontSize="24" fill={`rgba(${colors[0]},0.8)`}>✿</text>
        <defs>
          <linearGradient id="gal-cf-bg" x1="0" y1="0" x2="400" y2="260">
            <stop offset="0%" stopColor="#1a1228"/>
            <stop offset="100%" stopColor="#0a0a0f"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Generic / Workshop
  return (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg"
         style={{ width: '100%', height: '100%' }} aria-hidden="true">
      <rect width="400" height="260" fill="url(#gal-def-bg)"/>
      {[...Array(12)].map((_, i) => (
        <circle key={i} cx={30 + i * 32} cy={130 + Math.sin(i * 0.8) * 60} r={10 + i % 4 * 8}
                fill={`rgba(${i%2===0?colors[0]:colors[1]},${0.06 + i%3 * 0.04})`}/>
      ))}
      <circle cx="200" cy="130" r="55" fill={`rgba(${colors[0]},0.12)`} stroke={`rgba(${colors[0]},0.3)`} strokeWidth="2"/>
      <text x="200" y="142" textAnchor="middle" fontSize="36" fill={`rgba(${colors[0]},0.6)`}>✦</text>
      <defs>
        <linearGradient id="gal-def-bg" x1="0" y1="0" x2="400" y2="260">
          <stop offset="0%" stopColor="#1a1228"/>
          <stop offset="100%" stopColor="#0a0a0f"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
