import { Link } from 'react-router-dom';
import { COMPANY_INFO, formatIndianPhone } from '../constants/companyInfo';
import './ContactPage.css';

/**
 * Verified Contact Configuration for Shree Sakhi Events
 * Sourced strictly from confirmed company details.
 */
export const COMPANY_CONTACT_CONFIG = {
  companyName: COMPANY_INFO.name,
  tagline: 'Platform Dedicated to Women Empowerment, Entrepreneurship & Business Growth',
  city: 'Nashik, Maharashtra, India',

  // Registered Office
  address: {
    label: 'Registered Office',
    displayValue: 'Shree Sakhi Events, Nashik Road, Nashik',
    description: 'Official coordination desk for exhibition stall bookings and event management.',
  },

  // Phone Helpline
  phone: {
    label: 'Phone Helpline',
    numbers: [
      {
        raw: '9145683687',
        formatted: formatIndianPhone('9145683687'),
        telLink: 'tel:+919145683687',
      },
      {
        raw: '9595393434',
        formatted: formatIndianPhone('9595393434'),
        telLink: 'tel:+919595393434',
      },
    ],
    description: 'Direct coordinator contact lines for attendee assistance and event inquiries.',
  },

  // Official Email
  email: {
    label: 'Official Email',
    displayValue: 'shreesakhievents26@gmail.com',
    mailto: 'shreesakhievents26@gmail.com',
    description: 'Send your partnership proposals, stall inquiries, and general correspondence.',
  },

  // Official WhatsApp
  whatsapp: {
    label: 'Official WhatsApp',
    numbers: [
      {
        raw: '9145683687',
        formatted: formatIndianPhone('9145683687'),
        link: 'https://wa.me/919145683687?text=Hello%20Shree%20Sakhi%20Events%2C%20I%20would%20like%20to%20get%20in%20touch%20regarding%20your%20events.',
      },
      {
        raw: '9595393434',
        formatted: formatIndianPhone('9595393434'),
        link: 'https://wa.me/919595393434?text=Hello%20Shree%20Sakhi%20Events%2C%20I%20would%20like%20to%20get%20in%20touch%20regarding%20your%20events.',
      },
    ],
    description: 'Instant chat support for stall reservations, exhibitor queries, and event updates.',
  },

  // Key Event Coordinators
  coordinators: COMPANY_INFO.contactPersons.map((p) => ({
    name: p.name,
    phone: p.phone,
    formatted: formatIndianPhone(p.phone),
    telLink: `tel:+91${p.phone}`,
  })),
};

export default function ContactPage() {
  const config = COMPANY_CONTACT_CONFIG;

  return (
    <main id="contact-page" className="contact-page">
      {/* ── HERO SECTION ── */}
      <section className="contact-hero" aria-label="Contact Introduction">
        <div className="contact-hero__bg" aria-hidden="true">
          <div className="contact-hero__orb contact-hero__orb--pink" />
          <div className="contact-hero__orb contact-hero__orb--gold" />
          <div className="contact-hero__grid" />
        </div>

        <div className="container contact-hero__content">
          <div className="section-label animate-fade-up">
            <span className="section-label__dot" aria-hidden="true" />
            Connect With Us
          </div>

          <h1 className="contact-hero__title animate-fade-up delay-100">
            We’d Love to <span className="text-gradient">Hear From You</span>
          </h1>

          <p className="contact-hero__subtitle animate-fade-up delay-200">
            Whether you are an aspiring woman entrepreneur looking to book an exhibition stall,
            a potential sponsor, or an event attendee — the Shree Sakhi Events team in Nashik is
            here to assist you.
          </p>

          <div className="contact-hero-actions animate-fade-up delay-300">
            <Link to="/enquiry" className="btn btn-primary" id="hero-enquiry-link">
              Submit Space Enquiry →
            </Link>
            <a
              href={`mailto:${config.email.mailto}`}
              className="btn btn-outline"
              id="hero-email-link"
            >
              Email Coordinator
            </a>
          </div>
        </div>
      </section>

      {/* ── PRIMARY CONTACT CARDS GRID (4 COLUMNS) ── */}
      <section className="contact-section" aria-labelledby="contact-channels-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Communication Channels</span>
            <h2 id="contact-channels-heading">
              Our Contact <span className="text-gradient">Information</span>
            </h2>
            <p>Direct lines and verified coordination channels for all inquiries</p>
          </div>

          <div className="contact-grid">
            {/* Card 1: Registered Office */}
            <article className="contact-card card" id="contact-card-address">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--rose">
                <LocationPinIcon />
              </div>
              <div className="contact-card__body">
                <h3 className="contact-card__title">{config.address.label}</h3>
                <p className="contact-card__value">{config.address.displayValue}</p>
                <p className="contact-card__desc">{config.address.description}</p>
              </div>
              <div className="contact-card__footer">
                <span className="contact-card__meta-tag">Nashik Road Coordination Desk</span>
              </div>
            </article>

            {/* Card 2: Phone Helpline */}
            <article className="contact-card card" id="contact-card-phone">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--gold">
                <PhoneIcon />
              </div>
              <div className="contact-card__body">
                <h3 className="contact-card__title">{config.phone.label}</h3>
                <div className="contact-card__phone-list" role="list">
                  {config.phone.numbers.map((item) => (
                    <div key={item.raw} className="contact-card__phone-row" role="listitem">
                      <a
                        href={item.telLink}
                        className="contact-card__phone-link"
                        id={`contact-phone-link-${item.raw}`}
                        aria-label={`Call coordinator at ${item.formatted}`}
                      >
                        📞 {item.formatted}
                      </a>
                    </div>
                  ))}
                </div>
                <p className="contact-card__desc">{config.phone.description}</p>
              </div>
              <div className="contact-card__footer">
                <a
                  href={config.phone.numbers[0].telLink}
                  className="btn btn-primary btn-sm contact-card__btn"
                  id="contact-phone-call-btn"
                >
                  Call Primary Line
                </a>
              </div>
            </article>

            {/* Card 3: Official Email */}
            <article className="contact-card card" id="contact-card-email">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--purple">
                <EmailIcon />
              </div>
              <div className="contact-card__body">
                <h3 className="contact-card__title">{config.email.label}</h3>
                <p className="contact-card__value">
                  <a
                    href={`mailto:${config.email.mailto}`}
                    className="contact-card__email-link"
                    id="contact-email-text-link"
                    aria-label={`Send email to ${config.email.mailto}`}
                  >
                    {config.email.displayValue}
                  </a>
                </p>
                <p className="contact-card__desc">{config.email.description}</p>
              </div>
              <div className="contact-card__footer">
                <a
                  href={`mailto:${config.email.mailto}`}
                  className="btn btn-outline btn-sm contact-card__btn"
                  id="contact-email-mailto-btn"
                  aria-label={`Send email to ${config.email.mailto}`}
                >
                  Send Email ↗
                </a>
              </div>
            </article>

            {/* Card 4: Official WhatsApp */}
            <article className="contact-card card contact-card--whatsapp" id="contact-card-whatsapp">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--whatsapp">
                <WhatsAppIcon />
              </div>
              <div className="contact-card__body">
                <h3 className="contact-card__title">{config.whatsapp.label}</h3>
                <div className="contact-card__wa-list" role="list">
                  {config.whatsapp.numbers.map((item) => (
                    <div key={item.raw} className="contact-card__wa-row" role="listitem">
                      <span className="contact-card__wa-label">{item.formatted}</span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        id={`contact-whatsapp-btn-${item.raw}`}
                        aria-label={`Chat on WhatsApp with ${item.formatted}`}
                      >
                        Chat ↗
                      </a>
                    </div>
                  ))}
                </div>
                <p className="contact-card__desc">{config.whatsapp.description}</p>
              </div>
              <div className="contact-card__footer">
                <span className="contact-card__meta-tag contact-card__meta-tag--green">
                  ✓ Instant Messaging Available
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION: ENQUIRY PROMOTION ── */}
      <section className="contact-enquiry-banner" aria-labelledby="enquiry-banner-heading">
        <div className="container">
          <div className="enquiry-banner card glass">
            <div className="enquiry-banner__content">
              <span className="section-label">Online Assistance</span>
              <h2 id="enquiry-banner-heading" className="enquiry-banner__title">
                Planning an Exhibition Stall or <span className="text-gradient">Sponsorship?</span>
              </h2>
              <p className="enquiry-banner__desc">
                Submit your specific requirements through our dedicated online portal.
                Whether you need stall dimensions, pricing schedules, or partnership options,
                our organizing desk will review and connect with you directly.
              </p>
              <div className="enquiry-banner__highlights">
                <span>✓ Exhibition Stall Booking</span>
                <span>✓ Brand Sponsorship Opportunities</span>
                <span>✓ Artist & Cultural Showcases</span>
              </div>
            </div>
            <div className="enquiry-banner__action">
              <Link
                to="/enquiry"
                className="btn btn-primary btn-lg enquiry-banner__btn"
                id="contact-hero-enquiry-btn"
              >
                Go to Enquiry Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY EVENT COORDINATORS SECTION ── */}
      <section className="contact-details-section" aria-labelledby="coordinators-heading">
        <div className="container">
          <div className="card contact-coordinators-card">
            <div className="contact-coordinators-header">
              <h3 id="coordinators-heading" className="contact-section-subtitle">
                Official Event Coordinators
              </h3>
              <p className="contact-coordinators-desc">
                For prompt coordination, vendor inquiries, and stall allocations, contact our team members directly:
              </p>
            </div>

            <div className="contact-coordinators-grid" role="list">
              {config.coordinators.map((coordinator, idx) => (
                <div key={idx} className="coordinator-item" role="listitem">
                  <div className="coordinator-avatar" aria-hidden="true">
                    {coordinator.name.charAt(0)}
                  </div>
                  <div className="coordinator-info">
                    <span className="coordinator-name">{coordinator.name}</span>
                    <span className="coordinator-role">Event Coordination</span>
                    <a
                      href={coordinator.telLink}
                      className="coordinator-phone"
                      aria-label={`Call coordinator ${coordinator.name} at ${coordinator.formatted}`}
                    >
                      📞 {coordinator.formatted}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-coordinators-footer">
              <span>📍 Shree Sakhi Events • Nashik Road, Nashik, Maharashtra</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Accessible SVG Icons ── */

function LocationPinIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.59.13.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29" />
    </svg>
  );
}
