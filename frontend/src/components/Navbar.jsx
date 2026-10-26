import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COMPANY_INFO } from '../constants/companyInfo';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',  to: '/' },
  { label: 'About Us', to: '/about' },
  {
    label: 'Events',
    to: '/events',
    dropdown: [
      {
        label: 'All Events',
        to: '/events',
        icon: '🎪',
        badge: 'All',
        desc: 'Explore all exhibitions & events'
      },
      {
        label: 'Upcoming Events',
        to: '/upcoming-events',
        icon: '🟢',
        badge: 'Upcoming',
        desc: 'Upcoming exhibition dates & details'
      },
      {
        label: 'Past Exhibitions',
        to: '/past-events',
        icon: '🏆',
        badge: 'Archive',
        desc: 'Previous exhibitions & sponsor records'
      },
    ],
  },
  { label: 'Book Stall', to: '/book' },
  { label: 'Booking Status', to: '/book/status' },
  { label: 'Admin', to: '/admin' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);
  const location = useLocation();
  const menuRef  = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenDrop(null);
  }, [location.pathname]);

  // Close menus on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setOpenDrop(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isLinkActive = (link) => {
    if (link.dropdown) {
      return link.dropdown.some(d => location.pathname === d.to);
    }
    return location.pathname === link.to;
  };

  const primaryWhatsApp = COMPANY_INFO.whatsappNumbers[0];

  return (
    <header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      role="banner"
      ref={menuRef}
    >
      <div className="container navbar__inner">

        {/* ── Official Brand Logo ── */}
        <Link to="/" className="navbar__logo" aria-label="Shree Sakhi Events — Home">
          <img
            src="/shree-sakhi-logo-trimmed.png"
            alt="Shree Sakhi Events Logo"
            className="navbar__logo-img"
          />
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <nav aria-label="Main Navigation">
          <ul className="navbar__links" role="list">
            {NAV_LINKS.map((link) => {
              const hasDrop = !!link.dropdown;
              const isOpen = openDrop === link.to;
              const active = isLinkActive(link);

              return (
                <li
                  key={link.to}
                  className={`navbar__item ${hasDrop ? 'navbar__item--has-dropdown' : ''}`}
                  onMouseEnter={() => hasDrop && setOpenDrop(link.to)}
                  onMouseLeave={() => hasDrop && setOpenDrop(null)}
                >
                  {hasDrop ? (
                    <button
                      type="button"
                      className={`navbar__link navbar__link--btn ${active ? 'navbar__link--active' : ''}`}
                      onClick={() => setOpenDrop(isOpen ? null : link.to)}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      id="nav-dropdown-trigger"
                    >
                      <span>{link.label}</span>
                      <ChevronIcon className={`navbar__chevron ${isOpen ? 'navbar__chevron--open' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={link.to}
                      className={`navbar__link ${active ? 'navbar__link--active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Dropdown Menu Popup */}
                  {hasDrop && (
                    <div
                      className={`navbar__dropdown ${isOpen ? 'navbar__dropdown--open' : ''}`}
                      role="menu"
                      aria-label={`${link.label} options`}
                    >
                      <div className="navbar__dropdown-header">
                        <span>Exhibitions & Events</span>
                      </div>
                      <div className="navbar__dropdown-list">
                        {link.dropdown.map((sub) => {
                          const isSubActive = location.pathname === sub.to;
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={`navbar__dropdown-item ${isSubActive ? 'navbar__dropdown-item--active' : ''}`}
                              role="menuitem"
                              onClick={() => setOpenDrop(null)}
                            >
                              <span className="navbar__dropdown-icon" aria-hidden="true">{sub.icon}</span>
                              <div className="navbar__dropdown-content">
                                <div className="navbar__dropdown-title-row">
                                  <span className="navbar__dropdown-title">{sub.label}</span>
                                  {sub.badge && <span className="navbar__dropdown-badge">{sub.badge}</span>}
                                </div>
                                <span className="navbar__dropdown-desc">{sub.desc}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Primary Action Buttons (Enquiry & Booking) ── */}
        <div className="navbar__actions">
          {/* Enquiry Button via WhatsApp / Call */}
          <a
            href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20have%20an%20enquiry%20regarding%20stalls%20and%20events`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm navbar__enquiry-btn"
            aria-label="Send Enquiry via WhatsApp"
            id="navbar-enquiry-btn"
          >
            <span>💬 Enquiry</span>
          </a>

          {/* Booking Button linking to Registration module */}
          <Link
            to="/book"
            className="btn btn-primary btn-sm navbar__booking-btn"
            aria-label="Book a stall or register for an event"
            id="navbar-register-btn"
          >
            Book Stalls / Register
          </Link>

          {/* ── Mobile Hamburger Toggle ── */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            id="navbar-mobile-toggle"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>

      {/* ── Mobile Drawer Menu ── */}
      <div
        className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="container navbar__mobile-inner">
          <ul role="list" className="navbar__mobile-links">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                {link.dropdown ? (
                  <div className="navbar__mobile-group">
                    <button
                      className="navbar__mobile-link navbar__mobile-group-btn"
                      onClick={() => setOpenDrop(openDrop === link.to ? null : link.to)}
                      aria-expanded={openDrop === link.to}
                    >
                      <span>{link.label}</span>
                      <ChevronIcon className={`navbar__chevron ${openDrop === link.to ? 'navbar__chevron--open' : ''}`} />
                    </button>
                    {openDrop === link.to && (
                      <ul className="navbar__mobile-sub" role="list">
                        {link.dropdown.map(d => (
                          <li key={d.to}>
                            <Link
                              to={d.to}
                              className={`navbar__mobile-sub-link ${location.pathname === d.to ? 'active' : ''}`}
                            >
                              <span className="mobile-icon">{d.icon}</span>
                              <span>{d.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.to}
                    className={`navbar__mobile-link ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}

            {/* Mobile Actions */}
            <li className="navbar__mobile-actions">
              <a
                href={`https://wa.me/91${primaryWhatsApp}?text=Hello%20Shree%20Sakhi%20Events,%20I%20have%20an%20enquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                id="mobile-enquiry-btn"
              >
                💬 WhatsApp Enquiry
              </a>
              <Link
                to="/book"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                id="mobile-register-btn"
              >
                Book Stalls / Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

const ChevronIcon = ({ className = '', style }) => (
  <svg
    className={className}
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={style}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
