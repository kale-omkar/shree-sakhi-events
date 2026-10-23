import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import EventCard from '../components/EventCard';
import './HomePage.css';

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents]   = useState([]);
  const [upcomingEvents, setUpcomingEvents]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  useEffect(() => {
    Promise.all([eventsApi.getFeatured(), eventsApi.getUpcoming()])
      .then(([featured, upcoming]) => {
        setFeaturedEvents(featured);
        setUpcomingEvents(upcoming.filter(e => !featured.some(f => f.id === e.id)).slice(0, 3));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main id="home-page" className="home-page">

      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero section">
        {/* Background orbs */}
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__orb hero__orb--pink"/>
          <div className="hero__orb hero__orb--gold"/>
          <div className="hero__orb hero__orb--purple"/>
          <div className="hero__grid"/>
        </div>

        <div className="container hero__content">
          <div className="hero__badge animate-fade-up">
            <span className="badge-dot" style={{ background: '#22c55e' }} aria-hidden="true"/>
            Registration Open — Nashik Mahila Udyog Mela 2026
          </div>

          <h1 className="hero__title animate-fade-up delay-100">
            Celebrating Women Through
            <span className="text-gradient"> Culture, Creativity</span>
            <br/>& Community
          </h1>

          <p className="hero__subtitle animate-fade-up delay-200">
            Shree Sakhi Events brings Nashik's most vibrant events to life — from grand exhibitions
            and cultural festivals to empowering workshops. Be part of something extraordinary.
          </p>

          <div className="hero__actions animate-fade-up delay-300">
            <Link to="/events" className="btn btn-primary btn-lg" id="hero-explore-events">
              Explore Events
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" id="hero-register-now">
              Register Now →
            </Link>
          </div>

          {/* Stats */}
          <div className="hero__stats animate-fade-up delay-400" role="list" aria-label="Event statistics">
            {[
              { num: '200+', label: 'Women Entrepreneurs' },
              { num: '10K+', label: 'Happy Attendees'     },
              { num: '50+',  label: 'Events Organised'    },
              { num: '6+',   label: 'Years of Excellence' },
            ].map(stat => (
              <div key={stat.label} className="hero__stat" role="listitem">
                <span className="hero__stat-num">{stat.num}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating decoration */}
        <div className="hero__decoration animate-float" aria-hidden="true">
          <HeroDecoration />
        </div>
      </section>

      {/* ── FEATURED EVENTS ── */}
      <section className="home-section featured-section" aria-labelledby="featured-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Featured</span>
            <h2 id="featured-heading">
              Spotlight <span className="text-gradient">Events</span>
            </h2>
            <p>Our most celebrated and anticipated events of the season</p>
          </div>

          {loading ? (
            <div className="events-skeleton">
              {[1,2].map(i => <div key={i} className="skeleton event-skeleton"/>)}
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : featuredEvents.length === 0 ? (
            <EmptyState message="No featured events at the moment. Check back soon!" />
          ) : (
            <div className={`events-grid events-grid--featured events-grid--${Math.min(featuredEvents.length, 2)}`}>
              {featuredEvents.map((event, i) => (
                <div key={event.id} className={`animate-fade-up delay-${(i+1)*100}`}>
                  <EventCard event={event} featured={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="home-banner" aria-label="Nashik Exhibition announcement">
        <div className="container home-banner__inner">
          <div className="home-banner__text">
            <span className="section-label">Registration Open</span>
            <h2 className="home-banner__title">Nashik Mahila Udyog Mela 2026</h2>
            <p className="home-banner__desc">
              A grand <strong>2-month exhibition</strong> celebrating women entrepreneurs across Nashik.
              200+ stalls, live performances, and an unforgettable experience. Don't miss it!
            </p>
            <div className="home-banner__meta">
              <span>📅 Oct 15 – Dec 15, 2026</span>
              <span>📍 Nashik Municipal Exhibition Ground</span>
              <span>🎟️ Free Entry</span>
            </div>
            <Link to="/register?eventId=1" className="btn btn-gold btn-lg" id="banner-register-btn">
              Register Free →
            </Link>
          </div>
          <div className="home-banner__art" aria-hidden="true">
            <BannerArt />
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      {!loading && !error && upcomingEvents.length > 0 && (
        <section className="home-section" aria-labelledby="upcoming-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-label">What's Next</span>
              <h2 id="upcoming-heading">
                Upcoming <span className="text-gradient">Events</span>
              </h2>
              <p>Mark your calendar and secure your spot before seats fill up</p>
            </div>

            <div className="events-grid events-grid--3">
              {upcomingEvents.map((event, i) => (
                <div key={event.id} className={`animate-fade-up delay-${(i+1)*100}`}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            <div className="section-footer">
              <Link to="/events" className="btn btn-outline" id="home-view-all-events">
                View All Events →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY SAKHI ── */}
      <section className="home-section why-section" aria-labelledby="why-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2 id="why-heading">
              The <span className="text-gradient">Sakhi Difference</span>
            </h2>
          </div>
          <div className="why-grid">
            {[
              { icon: '🌸', title: 'Women-Centric',       desc: 'Every event is crafted to celebrate, empower, and uplift women across all walks of life.' },
              { icon: '🎭', title: 'Cultural Excellence', desc: 'Rich, authentic cultural experiences that blend tradition with modern flair.' },
              { icon: '🤝', title: 'Community First',     desc: 'Building lasting connections between entrepreneurs, artists, and families in Nashik.' },
              { icon: '✨', title: 'Premium Experience',  desc: 'Meticulous attention to detail ensuring every attendee leaves with beautiful memories.' },
            ].map((item, i) => (
              <div key={item.title} className={`why-card card animate-fade-up delay-${(i+1)*100}`}>
                <div className="why-card__icon" aria-hidden="true">{item.icon}</div>
                <h4 className="why-card__title">{item.title}</h4>
                <p className="why-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta" aria-label="Call to action">
        <div className="container home-cta__inner">
          <h2 className="home-cta__title">
            Ready to be part of<br/>
            <span className="text-gradient">Something Beautiful?</span>
          </h2>
          <p className="home-cta__desc">
            Join thousands of people who attend Shree Sakhi Events every year.
            Register today — it's free!
          </p>
          <div className="home-cta__actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
              Register for an Event
            </Link>
            <Link to="/events" className="btn btn-ghost btn-lg" id="cta-browse-btn">
              Browse All Events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Helpers ──
function ErrorMessage({ message }) {
  return (
    <div className="error-state" role="alert">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Unable to load events: {message}</p>
      <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Make sure the Spring Boot backend is running on port 8080.</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <span style={{ fontSize: '3rem' }}>🎪</span>
      <p>{message}</p>
    </div>
  );
}

function HeroDecoration() {
  return (
    <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="160" cy="160" r="155" stroke="rgba(194,24,91,0.15)" strokeWidth="2" strokeDasharray="8 6"/>
      <circle cx="160" cy="160" r="115" stroke="rgba(245,158,11,0.12)" strokeWidth="1.5" strokeDasharray="4 8"/>
      <circle cx="160" cy="160" r="75" stroke="rgba(194,24,91,0.2)" strokeWidth="1"/>
      <circle cx="160" cy="160" r="38" fill="rgba(194,24,91,0.15)" stroke="rgba(194,24,91,0.4)" strokeWidth="2"/>
      {/* Petals */}
      {[0,60,120,180,240,300].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        const x = 160 + 95 * Math.cos(rad);
        const y = 160 + 95 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="12" fill="rgba(194,24,91,0.25)" stroke="rgba(233,30,140,0.4)" strokeWidth="1.5"/>;
      })}
      {/* Center dot */}
      <circle cx="160" cy="160" r="14" fill="url(#hero-grad)"/>
      <defs>
        <radialGradient id="hero-grad">
          <stop offset="0%"  stopColor="#e91e8c"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function BannerArt() {
  return (
    <svg width="300" height="260" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stalls */}
      {[0,1,2,3,4].map(i => (
        <g key={i} transform={`translate(${20 + i * 54}, 60)`}>
          <rect width="44" height="80" rx="4" fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.2)`}
                stroke={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.5)`} strokeWidth="1.5"/>
          <rect x="5" y="5" width="34" height="25" rx="2" fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.3)`}/>
          <rect x="15" y="60" width="14" height="20" rx="2" fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.3)`}/>
        </g>
      ))}
      {/* Ground */}
      <rect x="10" y="140" width="280" height="4" rx="2" fill="rgba(194,24,91,0.3)"/>
      {/* Bunting */}
      {[0,1,2,3,4,5,6].map(i => (
        <polygon key={i} points={`${30+i*40},20 ${50+i*40},40 ${10+i*40},40`}
                 fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.5)`}/>
      ))}
      <line x1="10" y1="20" x2="290" y2="20" stroke="rgba(194,24,91,0.4)" strokeWidth="1.5"/>
      {/* Balloon */}
      <ellipse cx="260" cy="50" rx="18" ry="22" fill="rgba(233,30,140,0.4)" stroke="rgba(233,30,140,0.6)" strokeWidth="1.5"/>
      <line x1="260" y1="72" x2="255" y2="100" stroke="rgba(233,30,140,0.4)" strokeWidth="1.5"/>
      <ellipse cx="240" cy="35" rx="12" ry="15" fill="rgba(245,158,11,0.35)" stroke="rgba(245,158,11,0.55)" strokeWidth="1.5"/>
      <line x1="240" y1="50" x2="238" y2="75" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
      {/* Stars */}
      {[[50,200],[150,190],[250,210],[100,220],[200,195]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={3+i%3} fill={`rgba(${i%2===0?'194,24,91':'245,158,11'},0.3)`}/>
      ))}
    </svg>
  );
}
