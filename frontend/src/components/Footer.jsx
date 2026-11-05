import { Link } from 'react-router-dom';
import { COMPANY_INFO } from '../constants/companyInfo';
import InstagramIcon from './InstagramIcon';
import './Footer.css';

export default function Footer() {
  const primaryContact = COMPANY_INFO.contactPersons[0];

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">

        {/* Column 1: Brand */}
        <div className="site-footer__col site-footer__brand-col">
          <Link to="/" className="site-footer__logo-link" aria-label="Shree Sakhi Events — Home">
            <img
              src="/shree-sakhi-logo-trimmed.png"
              alt="Shree Sakhi Events Logo"
              className="site-footer__logo"
            />
          </Link>
          <p className="site-footer__desc">
            Empowering women entrepreneurs through exhibitions and business opportunities.
          </p>
          <div className="site-footer__location">
            <span className="site-footer__location-icon" aria-hidden="true">📍</span>
            <span>Nashik Road, Nashik</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="site-footer__col">
          <h4 className="site-footer__title">Quick Links</h4>
          <ul className="site-footer__nav-list">
            <li><Link to="/" className="site-footer__link">Home</Link></li>
            <li><Link to="/about" className="site-footer__link">About Us</Link></li>
            <li><Link to="/events" className="site-footer__link">Events</Link></li>
            <li><Link to="/gallery" className="site-footer__link">Gallery</Link></li>
            <li><Link to="/register" className="site-footer__link">Register / Booking</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact Us */}
        <div className="site-footer__col">
          <h4 className="site-footer__title">Contact Us</h4>
          <div className="site-footer__contact-info">
            <div className="site-footer__contact-row">
              <span className="site-footer__contact-label">Location</span>
              <span className="site-footer__contact-val">Nashik Road, Nashik</span>
            </div>

            <div className="site-footer__contact-row">
              <span className="site-footer__contact-label">Primary Contact</span>
              <span className="site-footer__contact-val">
                {primaryContact.name}:{' '}
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="site-footer__link site-footer__link--highlight"
                  aria-label={`Call ${primaryContact.name} at +91 ${primaryContact.phone}`}
                >
                  +91 {primaryContact.phone}
                </a>
              </span>
            </div>

            <div className="site-footer__contact-row">
              <span className="site-footer__contact-label">WhatsApp Support</span>
              <div className="site-footer__wa-links">
                {COMPANY_INFO.whatsappNumbers.map((num, idx) => (
                  <span key={num} className="site-footer__wa-item">
                    {idx > 0 && <span className="site-footer__separator" aria-hidden="true">/</span>}
                    <a
                      href={`https://wa.me/91${num}?text=Hello%20Shree%20Sakhi%20Events,%20I%20would%20like%20to%20enquire%20about%20your%20events`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-footer__link site-footer__wa-link"
                      aria-label={`Chat on WhatsApp with +91 ${num}`}
                    >
                      +91 {num}
                    </a>
                  </span>
                ))}
              </div>
            </div>

            <div className="site-footer__contact-row">
              <span className="site-footer__contact-label">Official Email</span>
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="site-footer__link site-footer__link--highlight"
                aria-label={`Send email to ${COMPANY_INFO.email}`}
              >
                {COMPANY_INFO.email}
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p className="site-footer__copy">
            © {new Date().getFullYear()} {COMPANY_INFO.name}, {COMPANY_INFO.city}. All rights reserved.
          </p>
          <div className="site-footer__bottom-links">
            <a
              href={COMPANY_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__bottom-instagram"
              aria-label="Follow us on Instagram (opens in a new tab)"
            >
              <InstagramIcon size={14} />
              <span>Instagram</span>
            </a>
            <span className="site-footer__dot-divider" aria-hidden="true">•</span>
            <Link to="/admin" className="site-footer__admin-link">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
