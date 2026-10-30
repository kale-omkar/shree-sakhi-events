import { Link } from 'react-router-dom';
import { COMPANY_INFO } from '../constants/companyInfo';
import InstagramIcon from './InstagramIcon';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">

        {/* Brand & Introduction Column */}
        <div className="site-footer__col site-footer__brand-col">
          <Link to="/" className="site-footer__logo-link" aria-label="Shree Sakhi Events — Home">
            <img
              src="/shree-sakhi-logo.png"
              alt="Shree Sakhi Events Logo"
              className="site-footer__logo"
            />
          </Link>
          <p className="site-footer__desc">
            A premier platform dedicated to women empowerment, entrepreneurship, and business growth.
            Bringing women entrepreneurs, home-based businesses, brands, and customers together under one roof.
          </p>
          <div className="site-footer__location">
            <span className="site-footer__pin-icon" aria-hidden="true">📍</span>
            <span>{COMPANY_INFO.address}</span>
          </div>
          <div className="site-footer__social">
            <a
              href={COMPANY_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__instagram-btn"
              aria-label="Follow Shree Sakhi Events on Instagram (opens in a new tab)"
            >
              <InstagramIcon size={18} />
              <span>Follow us on Instagram</span>
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="site-footer__col">
          <h4 className="site-footer__title">Quick Navigation</h4>
          <ul className="site-footer__nav-list">
            <li><Link to="/" className="site-footer__link">Home</Link></li>
            <li><Link to="/about" className="site-footer__link">About Us</Link></li>
            <li><Link to="/events" className="site-footer__link">All Events</Link></li>
            <li><Link to="/upcoming-events" className="site-footer__link">Upcoming Events</Link></li>
            <li><Link to="/past-events" className="site-footer__link">Past Exhibitions</Link></li>
            <li><Link to="/gallery" className="site-footer__link">Photo Gallery</Link></li>
            <li><Link to="/register" className="site-footer__link">Register / Booking</Link></li>
          </ul>
        </div>

        {/* Contact Numbers Column */}
        <div className="site-footer__col">
          <h4 className="site-footer__title">Contact Team</h4>
          <p className="site-footer__hint">For stalls, sponsorship & enquiries:</p>
          <ul className="site-footer__contact-list">
            {COMPANY_INFO.contactPersons.map(person => (
              <li key={person.phone} className="site-footer__contact-item">
                <span className="site-footer__contact-name">{person.name}:</span>
                <a href={`tel:${person.phone}`} className="site-footer__phone-link">
                  +91 {person.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* WhatsApp & Official Notice Column */}
        <div className="site-footer__col">
          <h4 className="site-footer__title">Enquiry & WhatsApp</h4>
          <p className="site-footer__hint">Direct WhatsApp Support:</p>
          <div className="site-footer__whatsapp-group">
            {COMPANY_INFO.whatsappNumbers.map(num => (
              <a
                key={num}
                href={`https://wa.me/91${num}?text=Hello%20Shree%20Sakhi%20Events,%20I%20would%20like%20to%20enquire%20about%20your%20events`}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__whatsapp-btn"
                aria-label={`Chat on WhatsApp with +91 ${num}`}
              >
                <span aria-hidden="true">💬</span> WhatsApp: +91 {num}
              </a>
            ))}
          </div>
          <div className="site-footer__email-box">
            <span className="site-footer__email-label">Official Email:</span>
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="site-footer__email-link"
              aria-label={`Send email to ${COMPANY_INFO.email}`}
            >
              <span aria-hidden="true">✉️</span> {COMPANY_INFO.email}
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
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
