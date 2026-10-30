import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import { COMPANY_INFO } from '../constants/companyInfo';
import EventCard from '../components/EventCard';
import GallerySection from '../components/GallerySection';
import './HomePage.css';

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const primaryWhatsApp = COMPANY_INFO.whatsappNumbers[0];

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      eventsApi.getFeatured().catch(err => {
        console.warn('Featured events fetch fallback:', err.message);
        return [];
      }),
      eventsApi.getUpcoming().catch(err => {
        console.warn('Upcoming events fetch fallback:', err.message);
        return [];
      }),
    ])
      .then(([featured, upcoming]) => {
        if (!isMounted) return;
        setFeaturedEvents(Array.isArray(featured) ? featured : []);
        const unfeatured = Array.isArray(upcoming)
          ? upcoming.filter(e => !featured.some(f => f.id === e.id)).slice(0, 3)
          : [];
        setUpcomingEvents(unfeatured);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <main id="home-page" className="home-page">

      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero introduction">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__orb hero__orb--pink" />
          <div className="hero__orb hero__orb--gold" />
          <div className="hero__orb hero__orb--purple" />
          <div className="hero__grid" />
        </div>

        <div className="container hero__content-wrap">
          <div className="hero__content">
            <div className="hero__badge animate-fade-up">
              <span className="badge-dot" aria-hidden="true" />
              Shree Sakhi Events • Nashik Road, Nashik
            </div>

            <h1 className="hero__title animate-fade-up delay-100">
              Grand Exhibitions for
              <span className="text-gradient"> Women Entrepreneurs</span>
              <br />&amp; Brands
            </h1>

            <p className="hero__subtitle animate-fade-up delay-200">
              {COMPANY_INFO.introduction}
            </p>

            {/* Clear Enquiry and Booking CTA Buttons */}
            <div className="hero__actions animate-fade-up delay-300">
              <Link to="/register" className="btn btn-primary btn-lg" id="hero-booking-btn">
                Book Stalls / Register
              </Link>
              <a
                href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20would%20like%20to%20enquire%20about%20exhibition%20stalls`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
                id="hero-enquiry-btn"
              >
                💬 WhatsApp Enquiry
              </a>
              <Link to="/events" className="btn btn-ghost btn-lg" id="hero-explore-btn">
                All Events →
              </Link>
            </div>

            {/* Documented Evidence from Details PDF */}
            <div className="hero__stats animate-fade-up delay-400" role="list" aria-label="Documented exhibition statistics">
              <div className="hero__stat" role="listitem">
                <span className="hero__stat-num">2,500+</span>
                <span className="hero__stat-label">Visitors per Exhibition</span>
              </div>
              <div className="hero__stat" role="listitem">
                <span className="hero__stat-num">65+</span>
                <span className="hero__stat-label">Stalls per Exhibition</span>
              </div>
              <div className="hero__stat" role="listitem">
                <span className="hero__stat-num">Nashik</span>
                <span className="hero__stat-label">Patidar Bhavan &amp; Rajmata Mangal Karyalay</span>
              </div>
            </div>
          </div>

          <div className="hero__logo-card animate-float" aria-hidden="true">
            <img
              src="/shree-sakhi-logo.png"
              alt="Shree Sakhi Events Official Logo"
              className="hero__logo-visual"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURED EXHIBITIONS & EVENTS ── */}
      <section className="home-section featured-section" aria-labelledby="featured-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Featured Spotlight</span>
            <h2 id="featured-heading">
              Featured <span className="text-gradient">Exhibitions</span>
            </h2>
            <p>Grand exhibitions connecting women entrepreneurs with customers</p>
          </div>

          {loading ? (
            <div className="events-skeleton">
              {[1, 2].map(i => <div key={i} className="skeleton event-skeleton" />)}
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : featuredEvents.length === 0 ? (
            <div className="empty-state card">
              <span style={{ fontSize: '2.5rem' }}>🎪</span>
              <h3>No Active Featured Exhibitions</h3>
              <p>Explore our past exhibition records or contact our team for upcoming event details.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/past-events" className="btn btn-outline btn-sm">
                  View Past Exhibitions
                </Link>
                <Link to="/upcoming-events" className="btn btn-primary btn-sm">
                  View Upcoming Dates
                </Link>
              </div>
            </div>
          ) : (
            <div className={`events-grid events-grid--featured events-grid--${Math.min(featuredEvents.length, 2)}`}>
              {featuredEvents.map((event, i) => (
                <div key={event.id} className={`animate-fade-up delay-${(i + 1) * 100}`}>
                  <EventCard event={event} featured={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── EXHIBITION PLATFORM BANNER ── */}
      <section className="home-banner" aria-label="Exhibition platform details">
        <div className="container home-banner__inner">
          <div className="home-banner__text">
            <span className="section-label">Exhibition Platform</span>
            <h2 className="home-banner__title">Opportunities for Women to Showcase &amp; Grow</h2>
            <p className="home-banner__desc">
              We bring women entrepreneurs, home-based businesses, brands and customers together under one roof with an incredible footfall of <strong>2,500+ visitors</strong> and <strong>65+ stalls</strong>.
            </p>
            <div className="home-banner__meta">
              <span>📍 Patidar Bhavan, Nashik Road &amp; Rajmata Mangal Karyalay, Meri</span>
              <span>📞 Contact: {COMPANY_INFO.contactPersons[0].phone}</span>
            </div>
            <div className="home-banner__actions">
              <Link to="/register" className="btn btn-primary btn-lg" id="banner-book-btn">
                Book Stalls / Register
              </Link>
              <a
                href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20want%20to%20enquire%20about%20booking%20a%20stall`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
                id="banner-enquiry-btn"
              >
                💬 Send WhatsApp Enquiry
              </a>
            </div>
          </div>

          <div className="home-banner__card card">
            <h4 style={{ color: 'var(--color-plum)', marginBottom: '0.75rem' }}>Our Purpose</h4>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.7', color: 'var(--color-text-muted)' }}>
              {COMPANY_INFO.introduction}
            </p>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS (IF AVAILABLE) ── */}
      {!loading && !error && upcomingEvents.length > 0 && (
        <section className="home-section" aria-labelledby="upcoming-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Upcoming Schedule</span>
              <h2 id="upcoming-heading">
                Upcoming <span className="text-gradient">Events</span>
              </h2>
              <p>Reserve your visitor entry or exhibitor stalls ahead of time</p>
            </div>

            <div className="events-grid events-grid--3">
              {upcomingEvents.map((event, i) => (
                <div key={event.id} className={`animate-fade-up delay-${(i + 1) * 100}`}>
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

      {/* ── OUR GALLERY (REAL EXHIBITION MOMENTS) ── */}
      <GallerySection />

      {/* ── DOCUMENTED PLATFORM HIGHLIGHTS ── */}
      <section className="home-section why-section" aria-labelledby="why-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">About the Platform</span>
            <h2 id="why-heading">
              Our <span className="text-gradient">Key Highlights</span>
            </h2>
            <p>Supported by documented facts from our grand exhibitions</p>
          </div>

          <div className="why-grid">
            {[
              {
                icon: '🌸',
                title: 'Women Empowerment',
                desc: 'A platform dedicated to women empowerment, entrepreneurship and business growth for home-based businesses and brands.'
              },
              {
                icon: '👥',
                title: '2,500+ Footfall',
                desc: 'Exhibitions bring together talented entrepreneurs and shoppers with 2,500+ visitors per event.'
              },
              {
                icon: '🎪',
                title: '65+ Stalls',
                desc: 'Each exhibition hosts 65+ stalls, providing opportunities for women to showcase their products.'
              },
              {
                icon: '🤝',
                title: 'Valued Sponsors',
                desc: 'Supported by sponsors including R M Silver, Patole Diagnostic Centre, Food Basket, Dr. Nidhi’s Multispecialty Clinic, and Dhobi Junction.'
              },
            ].map((item, i) => (
              <div key={item.title} className={`why-card card animate-fade-up delay-${(i + 1) * 100}`}>
                <div className="why-card__icon" aria-hidden="true">{item.icon}</div>
                <h4 className="why-card__title">{item.title}</h4>
                <p className="why-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="home-cta" aria-label="Call to action">
        <div className="container home-cta__inner">
          <h2 className="home-cta__title">
            Connect With
            <br />
            <span className="text-gradient">Shree Sakhi Events</span>
          </h2>
          <p className="home-cta__desc">
            Reach out to our team coordinators for exhibition enquiries, stall bookings, or sponsorship opportunities.
          </p>
          <div className="home-cta__actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="cta-book-btn">
              Book Stalls / Register
            </Link>
            <a
              href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20would%20like%20to%20enquire%20about%20stalls`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg"
              id="cta-enquiry-btn"
            >
              💬 WhatsApp Enquiry
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Helpers ──
function ErrorMessage({ message }) {
  return (
    <div className="error-state card" role="alert">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>Notice: Unable to load live event listings ({message}).</p>
      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-subtle)' }}>
        If running locally, please ensure the Spring Boot backend service is running on port 8080.
      </p>
    </div>
  );
}
