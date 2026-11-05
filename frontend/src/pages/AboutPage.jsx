import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_INFO } from '../constants/companyInfo';
import './AboutPage.css';

/* ── Intersection Observer hook for scroll-reveal ── */
function useScrollReveal() {
  const refs = useRef([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12 }
    );
    refs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const addRef = (el) => { if (el && !refs.current.includes(el)) refs.current.push(el); };
  return addRef;
}

export default function AboutPage() {
  const reveal = useScrollReveal();
  const primaryWhatsApp = COMPANY_INFO.whatsappNumbers[0];

  return (
    <main id="about-page" className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero" aria-label="About Shree Sakhi Events">
        <div className="about-hero__bg" aria-hidden="true">
          <div className="about-hero__orb about-hero__orb--1" />
          <div className="about-hero__orb about-hero__orb--2" />
          <div className="about-hero__grid" />
        </div>
        <div className="container about-hero__content">
          <span className="section-label animate-fade-up">About Shree Sakhi Events</span>
          <h1 className="about-hero__title animate-fade-up delay-100">
            About
            <span className="text-gradient"> Shree Sakhi Events</span>
          </h1>
          <p className="about-hero__subtitle animate-fade-up delay-200">
            {COMPANY_INFO.introduction}
          </p>
          <div className="about-hero__divider animate-fade-up delay-300" aria-hidden="true">
            <span className="about-hero__divider-flower">✿</span>
          </div>
        </div>
      </section>

      {/* ── COMPANY INTRODUCTION ── */}
      <section className="about-section" aria-labelledby="intro-heading" ref={reveal}>
        <div className="container about-intro">
          <div className="about-intro__text scroll-reveal" ref={reveal}>
            <span className="section-label">Introduction</span>
            <h2 id="intro-heading">
              Platform for <span className="text-gradient">Women Empowerment</span> &amp; Business Growth
            </h2>
            <p>
              {COMPANY_INFO.introduction}
            </p>
            <div className="about-intro__location-box">
              <span className="about-intro__pin" aria-hidden="true">📍</span>
              <div>
                <strong>Address:</strong>
                <p>{COMPANY_INFO.address}</p>
              </div>
            </div>
            <div className="about-intro__actions">
              <Link to="/events" className="btn btn-primary" id="about-explore-events-btn">
                View Exhibitions
              </Link>
              <a
                href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20would%20like%20to%20enquire%20about%20stalls`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                id="about-enquiry-btn"
              >
                💬 WhatsApp Enquiry
              </a>
            </div>
          </div>

          <div className="about-intro__visual scroll-reveal" ref={reveal} aria-hidden="true">
            <img
              src="/shree-sakhi-logo.png"
              alt="Shree Sakhi Events Official Logo"
              className="about-intro__logo-visual"
            />
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ── */}
      <section className="about-vm-section" aria-labelledby="vm-heading">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Guiding Principles</span>
            <h2 id="vm-heading">
              Our <span className="text-gradient">Vision &amp; Mission</span>
            </h2>
            <p>Empowering women entrepreneurs and creating meaningful market opportunities</p>
          </div>

          <div className="about-vm-grid">
            <div className="about-vm-card card scroll-reveal" ref={reveal}>
              <div className="about-vm-card__header">
                <div className="about-vm-card__badge" aria-hidden="true">
                  <span className="about-vm-card__icon">🌟</span>
                </div>
                <div>
                  <span className="section-label">Vision</span>
                  <h3 className="about-vm-card__title">Our Vision</h3>
                </div>
              </div>
              <blockquote className="about-vm-card__quote">
                "{COMPANY_INFO.vision}"
              </blockquote>
            </div>

            <div className="about-vm-card card card--mission scroll-reveal" ref={reveal}>
              <div className="about-vm-card__header">
                <div className="about-vm-card__badge about-vm-card__badge--gold" aria-hidden="true">
                  <span className="about-vm-card__icon">🎯</span>
                </div>
                <div>
                  <span className="section-label">Mission</span>
                  <h3 className="about-vm-card__title">Our Mission</h3>
                </div>
              </div>
              <blockquote className="about-vm-card__quote">
                "{COMPANY_INFO.mission}"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOCUMENTED PREVIOUS EXHIBITIONS ── */}
      <section className="about-section about-history" aria-labelledby="history-heading">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Exhibition Records</span>
            <h2 id="history-heading">
              Past <span className="text-gradient">Exhibition Details</span>
            </h2>
            <p>Supported by documented facts from our grand exhibitions</p>
          </div>

          <div className="about-history__grid">
            <div className="about-history__card card scroll-reveal" ref={reveal}>
              <div className="about-history__date">23 &amp; 24 August 2025</div>
              <h4>Grand Exhibition @ Patidar Bhavan</h4>
              <p className="about-history__venue">📍 Patidar Bhavan, Nashik Road, Nashik</p>
              <div className="about-history__metrics">
                <span><strong>2,500+</strong> Visitors</span>
                <span><strong>65+</strong> Stalls</span>
              </div>
              <p className="about-history__sponsors">
                <strong>Valued Sponsors:</strong> Main Sponsor: R M Silver | Co-Sponsor: Patole Diagnostic Centre | Associate Sponsor: Food Basket
              </p>
            </div>

            <div className="about-history__card card scroll-reveal" ref={reveal}>
              <div className="about-history__date">11 &amp; 12 October 2025</div>
              <h4>Second Grand Exhibition @ Rajmata Mangal Karyalay</h4>
              <p className="about-history__venue">📍 Rajmata Mangal Karyalay, Rasbihari Link Road, Meri, Nashik</p>
              <div className="about-history__metrics">
                <span><strong>2,500+</strong> Visitors</span>
                <span><strong>65+</strong> Stalls</span>
              </div>
              <p className="about-history__sponsors">
                <strong>Valued Sponsors:</strong> Title Sponsor: Dr. Nidhi’s Multispecialty Clinic | Associated Sponsor: Dhobi Junction
              </p>
            </div>

            <div className="about-history__card card scroll-reveal" ref={reveal}>
              <div className="about-history__date">26 &amp; 27 September</div>
              <h4>Second Grand Exhibition @ Patidar Bhavan</h4>
              <p className="about-history__venue">📍 Patidar Bhavan, Nashik Road, Nashik</p>
              <div className="about-history__metrics">
                <span><strong>2,500+</strong> Visitors</span>
                <span><strong>65+</strong> Stalls</span>
              </div>
              <p className="about-history__sponsors" style={{ fontStyle: 'italic', color: 'var(--color-text-subtle)' }}>
                * Year unconfirmed in documentation; presented without assumed dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFICIAL CONTACTS DIRECTORY ── */}
      <section className="about-section about-contact" aria-labelledby="contact-heading">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Contact Details</span>
            <h2 id="contact-heading">
              Phone &amp; <span className="text-gradient">Enquiry Contacts</span>
            </h2>
            <p>Reach out directly to the numbers listed in the company records</p>
          </div>

          <div className="about-contact__grid">
            {COMPANY_INFO.contactPersons.map((person, i) => (
              <div key={person.phone} className="about-contact__card card scroll-reveal" ref={reveal} style={{ animationDelay: `${i * 80}ms` }}>
                <span className="about-contact__avatar" aria-hidden="true">📞</span>
                <h4 className="about-contact__name">{person.name}</h4>
                <a href={`tel:${person.phone}`} className="about-contact__phone">
                  +91 {person.phone}
                </a>
              </div>
            ))}
          </div>

          <div className="about-contact__channels">
            <div className="about-contact__whatsapp-box card scroll-reveal" ref={reveal}>
              <div className="about-contact__whatsapp-header">
                <span className="about-contact__channel-icon" aria-hidden="true">💬</span>
                <div>
                  <strong>Enquiry Handling WhatsApp Numbers</strong>
                  <p>+91 {COMPANY_INFO.whatsappNumbers.join(', +91 ')}</p>
                </div>
              </div>
              <div className="about-contact__whatsapp-actions">
                {COMPANY_INFO.whatsappNumbers.map((num, idx) => (
                  <a
                    key={num}
                    href={`https://wa.me/91${num}?text=Hello%20Shree%20Sakhi%20Events,%20I%20would%20like%20to%20enquire%20about%20stalls`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${idx === 0 ? 'btn-primary' : 'btn-outline'}`}
                    aria-label={`Chat on WhatsApp with +91 ${num}`}
                  >
                    💬 Chat: +91 {num}
                  </a>
                ))}
              </div>
            </div>

            <div className="about-contact__email-box card scroll-reveal" ref={reveal}>
              <div className="about-contact__whatsapp-header">
                <span className="about-contact__channel-icon" aria-hidden="true">✉️</span>
                <div>
                  <strong>Official Email Address</strong>
                  <p>For stall bookings, sponsorships &amp; official correspondence</p>
                </div>
              </div>
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="btn btn-primary"
                aria-label={`Send email to ${COMPANY_INFO.email}`}
              >
                ✉️ {COMPANY_INFO.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta" aria-label="Join us call to action">
        <div className="container about-cta__inner">
          <h2 className="about-cta__title">
            Connect With
            <br />
            <span className="text-gradient">Shree Sakhi Events</span>
          </h2>
          <p className="about-cta__desc">
            For stalls, sponsorship or visitor enquiries, get in touch with our team coordinators.
          </p>
          <div className="about-cta__actions">
            <Link to="/upcoming-events" className="btn btn-primary btn-lg" id="about-cta-events-btn">
              View Upcoming Events
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" id="about-cta-book-btn">
              Book Stalls / Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
