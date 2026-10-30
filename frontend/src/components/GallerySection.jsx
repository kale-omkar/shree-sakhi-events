import { useState, useEffect, useCallback } from 'react';
import './GallerySection.css';

export const GALLERY_IMAGES = [
  {
    id: 1,
    src: '/gallery/gallery-inauguration.jpg',
    title: 'Grand Exhibition Inauguration Ceremony',
    subtitle: 'Ceremonial blessings & auspicious lamp lighting',
    category: 'Ceremony',
    badge: 'Inauguration',
    description: 'Coordinators of Shree Sakhi Events seeking divine blessings before welcoming thousands of eager visitors and inaugurating the grand fair in Nashik.',
    venue: 'Patidar Bhavan, Nashik Road',
    featured: true,
  },
  {
    id: 2,
    src: '/gallery/gallery-exhibition-hall-overview.jpg',
    title: 'Bustling Exhibition Hall & 65+ Stalls',
    subtitle: 'High footfall & vibrant shopping atmosphere',
    category: 'Exhibition',
    badge: '2,500+ Footfall',
    description: 'Vibrant exhibition arena hosting 65+ curated stalls offering designer apparel, handcrafted jewellery, gourmet delicacies, and lifestyle collections under one grand roof.',
    venue: 'Main Exhibition Pavilion',
    featured: true,
  },
  {
    id: 3,
    src: '/gallery/gallery-jewellery-lifestyle-stall.jpg',
    title: 'Designer Jewellery & Ethnic Wear Stalls',
    subtitle: 'Showcasing women entrepreneurs’ collections',
    category: 'Exhibition',
    badge: 'Stalls Spotlight',
    description: 'Exclusive boutique collection by Just For You Jewels and handcrafted ethnic outfits, creating high sales traction and delightful shopping experiences.',
    venue: 'Stall Section #12–15',
    featured: false,
  },
  {
    id: 4,
    src: '/gallery/gallery-exhibitor-felicitation-1.jpg',
    title: 'Exhibitor Felicitation & Token of Honor',
    subtitle: 'Celebrating passionate women business owners',
    category: 'Felicitation',
    badge: 'Felicitation',
    description: 'Shree Sakhi Events presenting a golden token of appreciation and felicitating successful women entrepreneurs participating in our grand exhibition.',
    venue: 'Apparel & Lifestyle Pavilion',
    featured: false,
  },
  {
    id: 5,
    src: '/gallery/gallery-exhibitor-felicitation-2.jpg',
    title: 'Recognizing Handcrafted Silk & Textile Artisans',
    subtitle: 'Empowering home-grown brands & artisans',
    category: 'Felicitation',
    badge: 'Empowerment',
    description: 'Honoring talented textile and handloom creators, fostering sustainable entrepreneurship, peer networking, and direct customer reach in Nashik.',
    venue: 'Handloom & Craft Pavilion',
    featured: false,
  },
  {
    id: 6,
    src: '/gallery/gallery-visitors-shopping.jpg',
    title: 'Visitors Exploring Stalls',
    subtitle: 'Happy shoppers discovering women-led brands',
    category: 'Exhibition',
    badge: 'Visitor Moments',
    description: 'Visitors browsing curated collections, interacting with women entrepreneurs, and experiencing the vibrant shopping atmosphere at Nashik exhibitions.',
    venue: 'Patidar Bhavan, Nashik Road',
    featured: false,
  },
  {
    id: 7,
    src: '/gallery/gallery-womens-empowerment.jpg',
    title: 'Women Empowerment in Action',
    subtitle: 'Home-grown brands taking center stage',
    category: 'Felicitation',
    badge: 'Empowerment',
    description: 'Women entrepreneurs confidently presenting their products, building networks, and celebrating financial independence through Shree Sakhi Events platform.',
    venue: 'Rajmata Mangal Karyalay',
    featured: false,
  },
  {
    id: 8,
    src: '/gallery/gallery-stall-showcase.jpg',
    title: 'Curated Stall Showcase',
    subtitle: 'Handcrafted jewellery, textiles & lifestyle',
    category: 'Exhibition',
    badge: 'Stall Spotlight',
    description: 'Beautifully arranged stalls featuring handcrafted jewellery, ethnic textiles, organic wellness products, and gourmet delicacies from Nashik women entrepreneurs.',
    venue: 'Stall Section #1–10',
    featured: false,
  },
  {
    id: 9,
    src: '/gallery/gallery-closing-ceremony.jpg',
    title: 'Grand Closing Ceremony',
    subtitle: 'Celebrating successful exhibition finale',
    category: 'Ceremony',
    badge: 'Ceremony',
    description: 'The grand closing ceremony honoring exhibitors, sponsors, and volunteers who made the exhibition a grand success in Nashik.',
    venue: 'Patidar Bhavan, Nashik Road',
    featured: false,
  },
];

export default function GallerySection({ isStandalonePage = false }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Lightbox handlers
  const openLightbox = (index) => {
    setSelectedIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  }, [selectedIndex]);

  const showPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex, closeLightbox, showNext, showPrev]);

  const currentImage = selectedIndex !== null ? GALLERY_IMAGES[selectedIndex] : null;

  return (
    <section
      id="gallery"
      className={`gallery-section ${isStandalonePage ? 'gallery-section--page' : ''}`}
      aria-labelledby="gallery-section-heading"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header gallery-section__header">
          <span className="section-label">Moments &amp; Memories</span>
          <h2 id="gallery-section-heading">
            Our <span className="text-gradient">Gallery</span>
          </h2>
          <p className="gallery-section__subtitle">
            Authentic glimpses from our Grand Exhibitions empowering women entrepreneurs, home-based brands, and bustling shopper communities across Nashik.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {GALLERY_IMAGES.map((item, index) => (
            <article
              key={item.id}
              className={`gallery-item ${item.featured ? 'gallery-item--featured' : ''}`}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
              aria-label={`View photo: ${item.title}`}
            >
              <div className="gallery-item__image-wrap">
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-item__img"
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>

        {/* Trust Stats Bar underneath Gallery */}
        <div className="gallery-stats-banner">
          <div className="gallery-stat-item">
            <span className="gallery-stat-icon">🎪</span>
            <div>
              <strong>65+ Curated Stalls</strong>
              <p>Per Grand Exhibition</p>
            </div>
          </div>
          <div className="gallery-stat-divider" aria-hidden="true" />
          <div className="gallery-stat-item">
            <span className="gallery-stat-icon">👥</span>
            <div>
              <strong>2,500+ Shoppers</strong>
              <p>Active Footfall</p>
            </div>
          </div>
          <div className="gallery-stat-divider" aria-hidden="true" />
          <div className="gallery-stat-item">
            <span className="gallery-stat-icon">🌸</span>
            <div>
              <strong>100% Women Led</strong>
              <p>Empowerment &amp; Growth</p>
            </div>
          </div>
          <div className="gallery-stat-divider" aria-hidden="true" />
          <div className="gallery-stat-item">
            <span className="gallery-stat-icon">📍</span>
            <div>
              <strong>Nashik Road</strong>
              <p>Patidar Bhavan &amp; Rajmata Hall</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL ── */}
      {currentImage && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          onClick={closeLightbox}
        >
          {/* Backdrop Blur Layer */}
          <div className="gallery-lightbox__backdrop" />

          {/* Modal Container */}
          <div
            className="gallery-lightbox__container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with counter & close */}
            <div className="gallery-lightbox__topbar">
              <div className="gallery-lightbox__counter">
                <span className="gallery-lightbox__pill">
                  Photo {selectedIndex + 1} of {GALLERY_IMAGES.length}
                </span>
                <span className="gallery-lightbox__badge">
                  {currentImage.badge}
                </span>
              </div>
              <button
                type="button"
                className="gallery-lightbox__close"
                onClick={closeLightbox}
                aria-label="Close photo viewer"
                autoFocus
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Main Stage with Image & Navigation */}
            <div className="gallery-lightbox__stage">
              {/* Prev Button */}
              {GALLERY_IMAGES.length > 1 && (
                <button
                  type="button"
                  className="gallery-lightbox__nav gallery-lightbox__nav--prev"
                  onClick={showPrev}
                  aria-label="Previous photo"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              {/* Photo Frame */}
              <div className="gallery-lightbox__image-wrapper">
                <img
                  src={currentImage.src}
                  alt={currentImage.title}
                  className="gallery-lightbox__image"
                />
              </div>

              {/* Next Button */}
              {GALLERY_IMAGES.length > 1 && (
                <button
                  type="button"
                  className="gallery-lightbox__nav gallery-lightbox__nav--next"
                  onClick={showNext}
                  aria-label="Next photo"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Captions & Info Footer */}
            <div className="gallery-lightbox__footer">
              <div className="gallery-lightbox__meta">
                <span className="gallery-lightbox__category">{currentImage.category}</span>
                <h3 id="lightbox-title" className="gallery-lightbox__title">{currentImage.title}</h3>
                <p className="gallery-lightbox__desc">{currentImage.description}</p>
                <span className="gallery-lightbox__venue">📍 {currentImage.venue}</span>
              </div>

              {/* Thumbnail Strip */}
              <div className="gallery-lightbox__thumbs">
                {GALLERY_IMAGES.map((thumb, idx) => (
                  <button
                    key={thumb.id}
                    type="button"
                    className={`gallery-lightbox__thumb-btn ${idx === selectedIndex ? 'gallery-lightbox__thumb-btn--active' : ''}`}
                    onClick={() => setSelectedIndex(idx)}
                    aria-label={`Jump to photo ${idx + 1}: ${thumb.title}`}
                  >
                    <img src={thumb.src} alt="" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
