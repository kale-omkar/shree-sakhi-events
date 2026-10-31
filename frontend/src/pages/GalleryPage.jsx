import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import GallerySection from '../components/GallerySection';
import './GalleryPage.css';

export default function GalleryPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Photo Gallery — Shree Sakhi Events | Grand Exhibitions Nashik';
  }, []);

  return (
    <main id="gallery-page" className="gallery-page">
      {/* ── Page Hero Header ── */}
      <section className="gallery-hero" aria-label="Photo Gallery Header">
        <div className="gallery-hero__bg" aria-hidden="true">
          <div className="gallery-hero__orb gallery-hero__orb--pink" />
          <div className="gallery-hero__orb gallery-hero__orb--gold" />
          <div className="gallery-hero__grid" />
        </div>

        <div className="container gallery-hero__content">
          <nav className="gallery-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="current">Gallery</span>
          </nav>

          <div className="gallery-hero__badge animate-fade-up">
            <span className="badge-dot" aria-hidden="true" />
            Official Exhibition Photo Gallery
          </div>

          <h1 className="gallery-hero__title animate-fade-up delay-100">
            Moments &amp; Glimpses of
            <span className="text-gradient"> Grand Exhibitions</span>
          </h1>

          <p className="gallery-hero__subtitle animate-fade-up delay-200">
            Explore authentic photographs from our exhibitions at Patidar Bhavan and Rajmata Mangal Karyalay — capturing vibrant stalls, empowering ceremonies, and active entrepreneurship in Nashik.
          </p>

          <div className="gallery-hero__actions animate-fade-up delay-300">
            <Link to="/book" className="btn btn-primary" id="gallery-hero-book-btn">
              Book a Stall in Next Exhibition →
            </Link>
            <Link to="/events" className="btn btn-outline" id="gallery-hero-events-btn">
              View Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive Gallery Section ── */}
      <GallerySection isStandalonePage={true} />
    </main>
  );
}
