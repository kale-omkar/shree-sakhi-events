import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
          <span className="section-label animate-fade-up">About Us</span>
          <h1 className="about-hero__title animate-fade-up delay-100">
            The Story Behind
            <span className="text-gradient"> Shree Sakhi</span>
          </h1>
          <p className="about-hero__subtitle animate-fade-up delay-200">
            Born from a passion to celebrate, empower, and unite — Shree Sakhi Events has been
            Nashik's trusted name for vibrant cultural experiences and women-centric events.
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
            <span className="section-label">Who We Are</span>
            <h2 id="intro-heading">
              Nashik's Premier <span className="text-gradient">Women-Centric</span> Event Organiser
            </h2>
            <p>
              Shree Sakhi Events is a Nashik-based event management company dedicated to crafting
              meaningful experiences that celebrate women's culture, creativity, and entrepreneurship.
              Founded with a heartfelt mission to give women a powerful platform, we have grown into
              one of the most trusted names in regional event management.
            </p>
            <p style={{ marginTop: '1rem' }}>
              From grand exhibitions and cultural festivals to empowering workshops and awards
              ceremonies, every Shree Sakhi event is a celebration of the strength, talent, and
              spirit of women. We bring together communities, create lasting memories, and open
              doors for women entrepreneurs across Nashik and beyond.
            </p>
            <div className="about-intro__actions">
              <Link to="/events" className="btn btn-primary" id="about-explore-events-btn">
                Explore Our Events
              </Link>
              <Link to="/contact" className="btn btn-outline" id="about-contact-btn">
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="about-intro__visual scroll-reveal" ref={reveal} aria-hidden="true">
            <AboutVisual />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="about-stats" aria-label="Organisation achievements">
        <div className="container">
          <div className="about-stats__grid">
            {[
              { num: '6+',   label: 'Years of Excellence',    icon: '🏆' },
              { num: '50+',  label: 'Events Organised',       icon: '🎪' },
              { num: '200+', label: 'Women Entrepreneurs',    icon: '👩‍💼' },
              { num: '10K+', label: 'Happy Attendees',        icon: '🎉' },
              { num: '25+',  label: 'Sponsor Partners',       icon: '🤝' },
              { num: '100%', label: 'Community-Driven',       icon: '🌸' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="about-stat-card card scroll-reveal"
                ref={reveal}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="about-stat-card__icon" aria-hidden="true">{stat.icon}</span>
                <span className="about-stat-card__num">{stat.num}</span>
                <span className="about-stat-card__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="about-vm-section about-vision" aria-labelledby="vision-heading">
        <div className="about-vm-section__bg" aria-hidden="true" />
        <div className="container about-vm-section__inner">
          <div className="about-vm-section__badge" aria-hidden="true">
            <VisionIcon />
          </div>
          <div className="about-vm-section__content scroll-reveal" ref={reveal}>
            <span className="section-label">Our Vision</span>
            <h2 id="vision-heading">
              A World Where Every Woman
              <span className="text-gradient"> Shines</span>
            </h2>
            <p className="about-vm-section__lead">
              To be the most celebrated platform that amplifies women's voices, talents, and
              entrepreneurial spirit — building a thriving ecosystem where every woman in Nashik
              and across Maharashtra has the opportunity to showcase her passion and potential.
            </p>
            <ul className="about-vm-section__points" role="list">
              {[
                'Create a connected network of 1,000+ women entrepreneurs by 2027',
                'Expand beyond Nashik to all major cities of Maharashtra',
                'Become the go-to platform for women-led brands and businesses',
                'Foster cultural pride while embracing modern empowerment',
              ].map((point, i) => (
                <li key={i} className="about-vm-section__point" role="listitem">
                  <span className="about-vm-section__point-dot" aria-hidden="true">✦</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="about-vm-section about-mission" aria-labelledby="mission-heading">
        <div className="container about-vm-section__inner about-vm-section__inner--reverse">
          <div className="about-vm-section__badge about-vm-section__badge--gold" aria-hidden="true">
            <MissionIcon />
          </div>
          <div className="about-vm-section__content scroll-reveal" ref={reveal}>
            <span className="section-label">Our Mission</span>
            <h2 id="mission-heading">
              Empowering Through
              <span className="text-gradient"> Events</span>
            </h2>
            <p className="about-vm-section__lead">
              To organise culturally rich, inclusive, and impactful events that celebrate women's
              achievements, build strong community bonds, and provide meaningful platforms for
              women entrepreneurs to grow their businesses and inspire others.
            </p>
            <div className="mission-pillars" role="list">
              {[
                { icon: '🌸', title: 'Celebrate',   desc: "Honour women's culture, heritage, and achievements through immersive events." },
                { icon: '💼', title: 'Empower',     desc: 'Provide women entrepreneurs with visibility, networking, and growth platforms.' },
                { icon: '🤝', title: 'Connect',     desc: 'Build lasting bonds between communities, families, and businesses.' },
                { icon: '✨', title: 'Inspire',     desc: 'Create experiences that motivate the next generation of women leaders.' },
              ].map((p, i) => (
                <div key={p.title} className="mission-pillar scroll-reveal" ref={reveal} role="listitem"
                     style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="mission-pillar__icon" aria-hidden="true">{p.icon}</span>
                  <div>
                    <strong className="mission-pillar__title">{p.title}</strong>
                    <p className="mission-pillar__desc">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="about-section about-values" aria-labelledby="values-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We Stand For</span>
            <h2 id="values-heading">
              Our Core <span className="text-gradient">Values</span>
            </h2>
            <p>The principles that guide everything we do at Shree Sakhi Events</p>
          </div>
          <div className="values-grid">
            {[
              {
                icon: '🌺', title: 'Women First',
                desc: 'Every decision is made with the best interests of women — as participants, entrepreneurs, and community members — at the centre.',
              },
              {
                icon: '🎨', title: 'Cultural Authenticity',
                desc: 'We honour the rich cultural traditions of Maharashtra while creating spaces for modern expression and innovation.',
              },
              {
                icon: '🌟', title: 'Excellence',
                desc: 'From planning to execution, we hold ourselves to the highest standards so every attendee leaves with extraordinary memories.',
              },
              {
                icon: '🫂', title: 'Inclusivity',
                desc: 'Our events welcome women of all ages, backgrounds, and walks of life — because every story deserves to be celebrated.',
              },
              {
                icon: '🌱', title: 'Community Growth',
                desc: "We invest in the long-term development of Nashik's community by creating platforms that generate livelihoods and opportunities.",
              },
              {
                icon: '💎', title: 'Integrity',
                desc: 'We operate with transparency, fairness, and accountability in every partnership, sponsorship, and event we organise.',
              },
            ].map((val, i) => (
              <div key={val.title} className="value-card card scroll-reveal" ref={reveal}
                   style={{ animationDelay: `${i * 70}ms` }}>
                <span className="value-card__icon" aria-hidden="true">{val.icon}</span>
                <h4 className="value-card__title">{val.title}</h4>
                <p className="value-card__desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM / FOUNDER NOTE ── */}
      <section className="about-founder" aria-labelledby="founder-heading">
        <div className="about-founder__bg" aria-hidden="true" />
        <div className="container">
          <div className="about-founder__card glass scroll-reveal" ref={reveal}>
            <div className="about-founder__avatar" aria-hidden="true">
              <FounderAvatar />
            </div>
            <div className="about-founder__text">
              <span className="section-label">A Message from the Founder</span>
              <blockquote className="about-founder__quote" id="founder-heading">
                "Every woman carries an extraordinary story within her. Shree Sakhi Events
                was born to give those stories the grand stage they deserve. When a woman
                entrepreneur stands tall at our exhibition, when a performer takes the spotlight
                at our festival, when a young girl watches and dares to dream bigger — that
                is why we do what we do."
              </blockquote>
              <cite className="about-founder__name">— Founder, Shree Sakhi Events, Nashik</cite>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta" aria-label="Join us call to action">
        <div className="container about-cta__inner">
          <h2 className="about-cta__title">
            Be Part of the
            <span className="text-gradient"> Sakhi Family</span>
          </h2>
          <p className="about-cta__desc">
            Whether you're a visitor, an exhibitor, a sponsor, or a performer —
            there's a place for you at Shree Sakhi Events.
          </p>
          <div className="about-cta__actions">
            <Link to="/upcoming-events" className="btn btn-primary btn-lg" id="about-cta-events-btn">
              View Upcoming Events
            </Link>
            <Link to="/enquiry" className="btn btn-outline btn-lg" id="about-cta-enquiry-btn">
              Send an Enquiry
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── SVG Illustrations ── */
function AboutVisual() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label="Decorative illustration of women in celebration">
      {/* Outer ring */}
      <circle cx="220" cy="220" r="200" stroke="rgba(194,24,91,0.12)" strokeWidth="2" strokeDasharray="10 8"/>
      <circle cx="220" cy="220" r="160" stroke="rgba(245,158,11,0.1)" strokeWidth="1.5" strokeDasharray="6 10"/>
      <circle cx="220" cy="220" r="120" stroke="rgba(194,24,91,0.18)" strokeWidth="1"/>
      {/* Center glow */}
      <circle cx="220" cy="220" r="80" fill="url(#about-center-grad)" opacity="0.6"/>
      {/* Petals */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        const x = 220 + 140 * Math.cos(rad);
        const y = 220 + 140 * Math.sin(rad);
        const colors = i % 2 === 0 ? ['rgba(194,24,91,0.3)','rgba(233,30,140,0.5)'] : ['rgba(245,158,11,0.25)','rgba(245,158,11,0.45)'];
        return <circle key={i} cx={x} cy={y} r="18" fill={colors[0]} stroke={colors[1]} strokeWidth="1.5"/>;
      })}
      {/* Center star */}
      <text x="220" y="234" textAnchor="middle" fontSize="40" fill="url(#about-text-grad)">✿</text>
      <defs>
        <radialGradient id="about-center-grad">
          <stop offset="0%" stopColor="rgba(194,24,91,0.25)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <linearGradient id="about-text-grad" x1="0" y1="0" x2="440" y2="440">
          <stop offset="0%" stopColor="#c2185b"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function VisionIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="rgba(194,24,91,0.12)" stroke="rgba(194,24,91,0.35)" strokeWidth="2"/>
      <path d="M32 16C24.27 16 18 23.16 18 32C18 40.84 24.27 48 32 48C39.73 48 46 40.84 46 32C46 23.16 39.73 16 32 16Z"
            fill="rgba(194,24,91,0.2)" stroke="rgba(194,24,91,0.6)" strokeWidth="1.5"/>
      <circle cx="32" cy="32" r="8" fill="url(#vision-grad)"/>
      <defs>
        <radialGradient id="vision-grad">
          <stop offset="0%" stopColor="#e91e8c"/>
          <stop offset="100%" stopColor="#c2185b"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function MissionIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)" strokeWidth="2"/>
      <path d="M20 44L32 18L44 44" stroke="rgba(245,158,11,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M23 38H41" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="32" r="4" fill="#f59e0b"/>
    </svg>
  );
}

function FounderAvatar() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="38" fill="url(#founder-bg)" stroke="url(#founder-border)" strokeWidth="2"/>
      {/* Silhouette */}
      <circle cx="40" cy="28" r="14" fill="rgba(255,255,255,0.3)"/>
      <path d="M14 72C14 58 26 50 40 50C54 50 66 58 66 72" fill="rgba(255,255,255,0.25)"/>
      {/* Bindi */}
      <circle cx="40" cy="22" r="2" fill="#f59e0b"/>
      <defs>
        <radialGradient id="founder-bg">
          <stop offset="0%" stopColor="rgba(194,24,91,0.6)"/>
          <stop offset="100%" stopColor="rgba(136,14,79,0.8)"/>
        </radialGradient>
        <linearGradient id="founder-border" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#e91e8c"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
