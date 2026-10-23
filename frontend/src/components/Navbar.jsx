import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',  to: '/' },
  { label: 'About', to: '/about' },
  {
    label: 'Events',
    to: '/events',
    dropdown: [
      {
        label: 'All Events',
        to: '/events',
        icon: '🎪',
        badge: 'All',
        desc: 'Explore all exhibitions & celebrations'
      },
      {
        label: 'Upcoming Events',
        to: '/upcoming-events',
        icon: '🟢',
        badge: 'Upcoming',
        desc: 'Upcoming dates & bookings'
      },
      {
        label: 'Past Events & Portfolio',
        to: '/past-events',
        icon: '🏆',
        badge: 'Archive',
        desc: 'Past events, photo gallery & memories'
      },
    ],
  },
  { label: 'Admin', to: '/admin' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [openDrop, setOpenDrop]   = useState(null); // which dropdown is active
  const location = useLocation();
  const menuRef  = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
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

  return (
    <nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
      ref={menuRef}
    >
      <div className="container navbar__inner">

        {/* ── Brand Logo ── */}
        <Link to="/" className="navbar__logo" aria-label="Shree Sakhi Events — Home">
          <div className="navbar__logo-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="url(#nav-brand-stroke)" strokeWidth="1.75"/>
              {/* Stylized Lotus Petals */}
              <path
                d="M18 5 C11 5 8 13 13 17 C8 19 11 31 18 31 C25 31 28 19 23 17 C28 13 25 5 18 5Z"
                fill="url(#nav-brand-fill)"
                opacity="0.95"
              />
              <circle cx="18" cy="17" r="3.2" fill="#ffffff" opacity="0.8"/>
              <defs>
                <linearGradient id="nav-brand-stroke" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#c2185b"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </linearGradient>
                <linearGradient id="nav-brand-fill" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#e91e8c"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-name">Shree Sakhi</span>
            <span className="navbar__logo-sub">Events</span>
          </div>
        </Link>

        {/* ── Desktop Navigation Links ── */}
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
                      <span>Explore Events</span>
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

        {/* ── Primary Action Button ── */}
        <div className="navbar__actions">
          <Link
            to="/register"
            className="btn btn-primary btn-sm navbar__cta"
            aria-label="Register for an event"
            id="navbar-register-btn"
          >
            Register Now
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
          <ul role="list">
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
            <li className="navbar__mobile-cta-item">
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                id="mobile-register-btn"
              >
                Register Now
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
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
