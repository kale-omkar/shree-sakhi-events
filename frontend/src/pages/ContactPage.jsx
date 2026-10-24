import { Link } from 'react-router-dom';
import './ContactPage.css';

/**
 * CONTACT CONFIGURATION OBJECT
 *
 * All company contact details and channels are centralized here.
 * Notice: Due to discrepancies with the company information document,
 * details are currently kept in clearly labeled temporary placeholders
 * with 'isConfirmed: false' until officially verified by the team.
 *
 * Once confirmed:
 * 1. Set isConfirmed: true
 * 2. Update address, phone, email, and WhatsApp numbers.
 * 3. Provide official URLs in socialMedia to activate working social links.
 */
export const COMPANY_CONTACT_CONFIG = {
  companyName: 'Shree Sakhi Events',
  tagline: 'Celebrating Women Through Culture, Creativity & Community',
  city: 'Nashik, Maharashtra, India',

  // Address configuration
  address: {
    isConfirmed: false,
    label: 'Registered Office',
    displayValue: 'Address Pending Official Confirmation',
    subText: 'Nashik, Maharashtra, India',
    statusBadge: 'Pending Confirmation',
    note: 'Awaiting team verification against official company documents.',
    googleMapsUrl: null, // Will be set to official Google Maps link once confirmed
  },

  // Phone configuration
  phone: {
    isConfirmed: false,
    label: 'Phone Helpline',
    displayValue: '+91 [Helpline Pending Confirmation]',
    telNumber: null, // e.g. '+919876543210' once confirmed
    timings: 'Monday – Saturday: 10:00 AM – 7:00 PM IST',
    statusBadge: 'Pending Confirmation',
    note: 'Direct line will be activated once confirmed by company administration.',
  },

  // Email configuration
  email: {
    isConfirmed: false,
    label: 'Official Email',
    displayValue: 'email-pending-confirmation@sakhievents.com',
    mailto: null, // e.g. 'info@sakhievents.com' once confirmed
    statusBadge: 'Pending Confirmation',
    note: 'For direct communication and faster tracking, please use the Enquiry Form.',
  },

  // WhatsApp configuration
  whatsapp: {
    isConfirmed: false,
    label: 'WhatsApp Quick Chat',
    displayValue: 'WhatsApp Support (Verification in Progress)',
    waNumber: null, // Digits only e.g. '919876543210' once confirmed
    statusBadge: 'Pending Confirmation',
    defaultMessage: 'Hello Shree Sakhi Events team, I would like to get in touch regarding your events.',
    note: 'Instant chat will be enabled as soon as the official business number is verified.',
  },

  // Working Hours
  workingHours: [
    { days: 'Monday – Friday', hours: '10:00 AM – 7:00 PM IST' },
    { days: 'Saturday', hours: '10:00 AM – 5:00 PM IST' },
    { days: 'Sunday', hours: 'Closed (Open during active exhibition weekends)' },
  ],

  // Social Media Channels
  // Strict rule: Social links only render as clickable external links when official URLs are available.
  socialMedia: [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@shreesakhievents',
      officialUrl: null, // Official URL pending verification
      isAvailable: false,
      badgeText: 'Handle Pending Confirmation',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: 'Shree Sakhi Events',
      officialUrl: null, // Official URL pending verification
      isAvailable: false,
      badgeText: 'Page Pending Confirmation',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: 'Shree Sakhi Events Official',
      officialUrl: null, // Official URL pending verification
      isAvailable: false,
      badgeText: 'Channel Pending Confirmation',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Shree Sakhi Events',
      officialUrl: null, // Official URL pending verification
      isAvailable: false,
      badgeText: 'Profile Pending Confirmation',
    },
  ],
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
            Get in Touch
          </div>

          <h1 className="contact-hero__title animate-fade-up delay-100">
            We’d Love to
            <span className="text-gradient"> Hear From You</span>
          </h1>

          <p className="contact-hero__subtitle animate-fade-up delay-200">
            Whether you are an aspiring woman entrepreneur, an artisan wanting to book an exhibition
            stall, a sponsor, or an attendee — the Shree Sakhi Events team is here to assist you.
          </p>

          {/* Verification Status Notice */}
          <div className="contact-notice animate-fade-up delay-300" role="status">
            <span className="contact-notice__icon" aria-hidden="true">ℹ️</span>
            <div className="contact-notice__text">
              <strong>Official Contact Verification in Progress:</strong> Direct contact channels are
              currently being aligned with official company documents. For guaranteed priority response,
              please submit our{' '}
              <Link to="/enquiry" className="contact-notice__link" id="notice-enquiry-link">
                Online Enquiry Form →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT CHANNELS GRID ── */}
      <section className="contact-section" aria-labelledby="contact-channels-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Communication Channels</span>
            <h2 id="contact-channels-heading">
              Our Contact <span className="text-gradient">Information</span>
            </h2>
            <p>Direct lines and coordination channels for all inquiries</p>
          </div>

          <div className="contact-grid">
            {/* Card 1: Address */}
            <article className="contact-card card" id="contact-card-address">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--rose">
                <LocationPinIcon />
              </div>
              <div className="contact-card__body">
                <div className="contact-card__header">
                  <h3 className="contact-card__title">{config.address.label}</h3>
                  <span className="contact-badge contact-badge--pending">
                    {config.address.statusBadge}
                  </span>
                </div>
                <p className="contact-card__value">{config.address.displayValue}</p>
                <p className="contact-card__sub">{config.address.subText}</p>
                <p className="contact-card__note">{config.address.note}</p>
              </div>
              <div className="contact-card__footer">
                {config.address.isConfirmed && config.address.googleMapsUrl ? (
                  <a
                    href={config.address.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    id="contact-map-btn"
                  >
                    View on Map ↗
                  </a>
                ) : (
                  <span className="contact-card__action-hint">
                    📍 Location map coordinates will be linked once verified
                  </span>
                )}
              </div>
            </article>

            {/* Card 2: Phone */}
            <article className="contact-card card" id="contact-card-phone">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--gold">
                <PhoneIcon />
              </div>
              <div className="contact-card__body">
                <div className="contact-card__header">
                  <h3 className="contact-card__title">{config.phone.label}</h3>
                  <span className="contact-badge contact-badge--pending">
                    {config.phone.statusBadge}
                  </span>
                </div>
                <p className="contact-card__value">{config.phone.displayValue}</p>
                <p className="contact-card__sub">🕒 {config.phone.timings}</p>
                <p className="contact-card__note">{config.phone.note}</p>
              </div>
              <div className="contact-card__footer">
                {config.phone.isConfirmed && config.phone.telNumber ? (
                  <a
                    href={`tel:${config.phone.telNumber}`}
                    className="btn btn-primary btn-sm"
                    id="contact-phone-call-btn"
                  >
                    Call Helpline
                  </a>
                ) : (
                  <span className="contact-card__action-hint">
                    📞 Helpline dialing disabled pending team confirmation
                  </span>
                )}
              </div>
            </article>

            {/* Card 3: Email */}
            <article className="contact-card card" id="contact-card-email">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--purple">
                <EmailIcon />
              </div>
              <div className="contact-card__body">
                <div className="contact-card__header">
                  <h3 className="contact-card__title">{config.email.label}</h3>
                  <span className="contact-badge contact-badge--pending">
                    {config.email.statusBadge}
                  </span>
                </div>
                <p className="contact-card__value contact-card__value--email">
                  {config.email.displayValue}
                </p>
                <p className="contact-card__sub">📬 24–48 hours turnaround time</p>
                <p className="contact-card__note">{config.email.note}</p>
              </div>
              <div className="contact-card__footer">
                {config.email.isConfirmed && config.email.mailto ? (
                  <a
                    href={`mailto:${config.email.mailto}`}
                    className="btn btn-outline btn-sm"
                    id="contact-email-mailto-btn"
                  >
                    Send Email
                  </a>
                ) : (
                  <Link to="/enquiry" className="btn btn-outline btn-sm" id="contact-email-enquiry-btn">
                    Use Enquiry Form →
                  </Link>
                )}
              </div>
            </article>

            {/* Card 4: WhatsApp */}
            <article className="contact-card card contact-card--highlight" id="contact-card-whatsapp">
              <div className="contact-card__icon-wrap contact-card__icon-wrap--whatsapp">
                <WhatsAppIcon />
              </div>
              <div className="contact-card__body">
                <div className="contact-card__header">
                  <h3 className="contact-card__title">{config.whatsapp.label}</h3>
                  <span className="contact-badge contact-badge--pending">
                    {config.whatsapp.statusBadge}
                  </span>
                </div>
                <p className="contact-card__value">{config.whatsapp.displayValue}</p>
                <p className="contact-card__sub">💬 Instant event assistance & updates</p>
                <p className="contact-card__note">{config.whatsapp.note}</p>
              </div>
              <div className="contact-card__footer">
                {config.whatsapp.isConfirmed && config.whatsapp.waNumber ? (
                  <a
                    href={`https://wa.me/${config.whatsapp.waNumber}?text=${encodeURIComponent(
                      config.whatsapp.defaultMessage
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-sm"
                    id="contact-whatsapp-chat-btn"
                  >
                    Chat on WhatsApp ↗
                  </a>
                ) : (
                  <div className="contact-card__whatsapp-pending">
                    <button
                      type="button"
                      className="btn btn-whatsapp btn-sm"
                      disabled
                      aria-disabled="true"
                      id="contact-whatsapp-disabled-btn"
                      title="WhatsApp number pending team confirmation"
                    >
                      WhatsApp Unavailable
                    </button>
                    <span className="contact-card__action-hint">
                      Will be activated once official number is submitted
                    </span>
                  </div>
                )}
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
                Have a Question or Need a
                <span className="text-gradient"> Custom Stall Booking?</span>
              </h2>
              <p className="enquiry-banner__desc">
                Skip the wait! Submit your requirement directly through our dedicated Enquiry portal.
                Whether you need details on exhibition stall pricing, sponsorship packages, or event
                participation, our team will review and respond directly to you.
              </p>
              <div className="enquiry-banner__highlights">
                <span>✓ Stall & Space Reservations</span>
                <span>✓ Sponsorship Opportunities</span>
                <span>✓ Group Registrations & Feedback</span>
              </div>
            </div>
            <div className="enquiry-banner__action">
              <Link
                to="/enquiry"
                className="btn btn-primary btn-lg enquiry-banner__btn"
                id="contact-hero-enquiry-btn"
              >
                Go to Enquiry Page →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPERATING HOURS & SOCIAL CHANNELS ── */}
      <section className="contact-details-section" aria-labelledby="office-hours-heading">
        <div className="container contact-details-grid">
          {/* Working Hours */}
          <div className="card contact-hours-card">
            <h3 id="office-hours-heading" className="contact-section-subtitle">
              Office Coordination Hours
            </h3>
            <p className="contact-hours-desc">
              Our coordination desk operates during the following schedule for attendee inquiries,
              vendor coordination, and event bookings:
            </p>
            <ul className="contact-hours-list" role="list">
              {config.workingHours.map((item, idx) => (
                <li key={idx} className="contact-hours-item" role="listitem">
                  <span className="contact-hours-days">{item.days}</span>
                  <span className="contact-hours-time">{item.hours}</span>
                </li>
              ))}
            </ul>
            <div className="contact-hours-footer">
              <span className="contact-hours-badge">📍 Nashik Office</span>
              <p className="contact-hours-note">
                Response times during official state holidays and exhibition setup days may vary.
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="card contact-social-card" aria-labelledby="social-channels-heading">
            <h3 id="social-channels-heading" className="contact-section-subtitle">
              Official Social Channels
            </h3>
            <p className="contact-social-desc">
              Follow Shree Sakhi Events on social platforms to catch live event stories, highlights,
              and announcements:
            </p>

            <div className="contact-social-list" role="list">
              {config.socialMedia.map((social) => {
                const hasOfficialUrl = social.isAvailable && social.officialUrl;

                return (
                  <div key={social.id} className="contact-social-item" role="listitem">
                    <div className="contact-social-info">
                      <span className="contact-social-name">{social.name}</span>
                      <span className="contact-social-handle">{social.handle}</span>
                    </div>

                    {hasOfficialUrl ? (
                      <a
                        href={social.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm contact-social-btn"
                        id={`social-link-${social.id}`}
                        aria-label={`Visit Shree Sakhi Events on ${social.name}`}
                      >
                        Visit Channel ↗
                      </a>
                    ) : (
                      <span
                        className="contact-badge contact-badge--pending contact-social-pending"
                        id={`social-pending-${social.id}`}
                        title="Official channel pending team confirmation"
                      >
                        {social.badgeText}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="contact-social-disclaimer">
              🔒 In accordance with project security standards, only verified official URLs will be
              linked to prevent unauthenticated redirection.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── SVG Icons ── */

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
