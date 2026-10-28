import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { COMPANY_INFO, formatIndianPhone } from '../constants/companyInfo';
import { enquiriesApi } from '../api/eventsApi';
import './EnquiryPage.css';

/**
 * Official Enquiry Notification Recipient
 * Sourced strictly from confirmed company configuration.
 */
export const ENQUIRY_NOTIFICATION_RECIPIENT = COMPANY_INFO.enquiryNotificationEmail || 'shreesakhi26@gmail.com';

/**
 * Suggested Enquiry Categories for Shree Sakhi Events
 */
const ENQUIRY_CATEGORIES = [
  {
    id: 'stall-booking',
    label: 'Stall Booking / Exhibition Space',
    desc: 'Reserve exhibitor stalls for handcrafted goods, fashion, food, lifestyle, and artisanal products.',
    icon: '🎪',
  },
  {
    id: 'sponsorship',
    label: 'Sponsorship & Partnerships',
    desc: 'Brand integration, event title/co-sponsorships, and community outreach partnerships.',
    icon: '🤝',
  },
  {
    id: 'participation',
    label: 'Event Participation & Performance',
    desc: 'Stage performances, workshops, panel talks, cultural showcases, and volunteer involvement.',
    icon: '🎭',
  },
  {
    id: 'general',
    label: 'General Inquiry & Support',
    desc: 'Event schedules, attendee passes, venue information, accessibility, and general questions.',
    icon: '💬',
  },
  {
    id: 'media',
    label: 'Media & Press',
    desc: 'Press passes, interview requests, media kits, photography permissions, and publication queries.',
    icon: '📰',
  },
];

const INITIAL_FORM = {
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  enquiryType: '',
  message: '',
};

/**
 * Resolves initial enquiry category from URL query parameters (e.g. /enquiry?type=stall)
 * @param {URLSearchParams} searchParams
 * @returns {string} pre-selected category label or empty string
 */
function getPreselectedCategory(searchParams) {
  const rawType = (searchParams.get('type') || searchParams.get('category') || '').toLowerCase();
  if (!rawType) return '';

  if (rawType.includes('stall') || rawType.includes('exhibit')) {
    return 'Stall Booking / Exhibition Space';
  }
  if (rawType.includes('sponsor') || rawType.includes('partner')) {
    return 'Sponsorship & Partnerships';
  }
  if (rawType.includes('participat') || rawType.includes('perform')) {
    return 'Event Participation & Performance';
  }
  if (rawType.includes('support') || rawType.includes('general')) {
    return 'General Inquiry & Support';
  }
  if (rawType.includes('media') || rawType.includes('press')) {
    return 'Media & Press';
  }
  const direct = ENQUIRY_CATEGORIES.find(c => c.label.toLowerCase() === rawType);
  return direct ? direct.label : '';
}

/**
 * Client-side validation function
 * @param {typeof INITIAL_FORM} formValues
 * @returns {Record<string, string>} error messages keyed by field name
 */
function validateEnquiryForm(formValues) {
  const errors = {};

  // 1. Full Name
  const trimmedName = (formValues.fullName || '').trim();
  if (!trimmedName) {
    errors.fullName = 'Full name is required.';
  } else if (trimmedName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
    errors.fullName = 'Please enter a valid name (letters, spaces, and hyphens only).';
  }

  // 2. Company Name (Optional, length bounded)
  const trimmedCompany = (formValues.companyName || '').trim();
  if (trimmedCompany.length > 100) {
    errors.companyName = 'Company or brand name cannot exceed 100 characters.';
  }

  // 3. Email
  const trimmedEmail = (formValues.email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
  }

  // 4. Phone Number (10 to 13 digits expected)
  const phoneDigits = (formValues.phone || '').replace(/\D/g, '');
  if (!phoneDigits) {
    errors.phone = 'Phone number is required.';
  } else if (phoneDigits.length < 10) {
    errors.phone = 'Please enter a valid 10-digit phone number.';
  } else if (phoneDigits.length > 13) {
    errors.phone = 'Phone number cannot exceed 13 digits.';
  }

  // 5. Enquiry Type
  const validCategories = ENQUIRY_CATEGORIES.map(cat => cat.label);
  if (!formValues.enquiryType || !validCategories.includes(formValues.enquiryType)) {
    errors.enquiryType = 'Please select a valid enquiry category.';
  }

  // 6. Message
  const trimmedMessage = (formValues.message || '').trim();
  if (!trimmedMessage) {
    errors.message = 'Please provide details about your enquiry.';
  } else if (trimmedMessage.length < 10) {
    errors.message = 'Message must be at least 10 characters so our team can assist you.';
  } else if (trimmedMessage.length > 1000) {
    errors.message = 'Message cannot exceed 1,000 characters.';
  }

  return errors;
}

/**
 * Format ISO datetime string to Indian readable date/time
 */
function formatEnquiryDateTime(isoString) {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return 'Just now';
  }
}

export default function EnquiryPage() {
  const [searchParams] = useSearchParams();

  // Initialize form state once, including URL query params if provided
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    enquiryType: getPreselectedCategory(searchParams),
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // References for keyboard accessibility & auto-focus
  const fullNameRef = useRef(null);
  const companyRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const enquiryTypeRef = useRef(null);
  const messageRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const feedbackRef = useRef(null);

  const fieldRefs = {
    fullName: fullNameRef,
    companyName: companyRef,
    email: emailRef,
    phone: phoneRef,
    enquiryType: enquiryTypeRef,
    message: messageRef,
  };

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (touched[name]) {
      const fieldErrors = validateEnquiryForm(nextForm);
      setErrors(prev => {
        const nextErrors = { ...prev };
        if (fieldErrors[name]) {
          nextErrors[name] = fieldErrors[name];
        } else {
          delete nextErrors[name];
        }
        return nextErrors;
      });
    }
  };

  // Handle field blur for immediate feedback
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const currentErrors = validateEnquiryForm(form);
    setErrors(prev => {
      const nextErrors = { ...prev };
      if (currentErrors[name]) {
        nextErrors[name] = currentErrors[name];
      } else {
        delete nextErrors[name];
      }
      return nextErrors;
    });
  };

  // Form submission handler connected to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Mark all fields touched
    const allTouched = {
      fullName: true,
      companyName: true,
      email: true,
      phone: true,
      enquiryType: true,
      message: true,
    };
    setTouched(allTouched);

    const validationErrors = validateEnquiryForm(form);
    const hasErrors = Object.keys(validationErrors).length > 0;

    if (hasErrors) {
      setErrors(validationErrors);

      const errorFieldKeys = ['fullName', 'companyName', 'email', 'phone', 'enquiryType', 'message'];
      const firstInvalidField = errorFieldKeys.find(key => validationErrors[key]);

      if (firstInvalidField && fieldRefs[firstInvalidField]?.current) {
        fieldRefs[firstInvalidField].current.focus();
      } else if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
      return;
    }

    // No client validation errors — proceed with backend submission
    setErrors({});
    setIsSubmitting(true);

    const payload = {
      fullName: form.fullName.trim(),
      companyName: form.companyName ? form.companyName.trim() : null,
      email: form.email.trim(),
      phone: form.phone.trim(),
      enquiryType: form.enquiryType.trim(),
      message: form.message.trim(),
    };

    try {
      const response = await enquiriesApi.submit(payload);

      if (response.ok && response.success) {
        // Genuine success confirmed by backend database persistence!
        const savedEntity = response.data || {};
        const referenceId = savedEntity.id || Date.now();
        const referenceCode = `SSE-ENQ-${String(referenceId).padStart(5, '0')}`;

        setIsSubmitting(false);
        setSubmittedData({
          ...form,
          id: referenceId,
          referenceCode,
          createdAt: savedEntity.createdAt || new Date().toISOString(),
        });

        setTimeout(() => {
          if (feedbackRef.current) {
            feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            feedbackRef.current.focus();
          } else {
            window.scrollTo({ top: 100, behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Backend returned an error response
        setIsSubmitting(false);

        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          setErrors(response.data);
          setServerError({
            message: response.message || 'Validation failed on the server. Please check the highlighted fields.',
            details: Object.values(response.data),
          });
        } else {
          setServerError({
            message: response.message || `Submission failed with status ${response.status || 400}. Please try again.`,
          });
        }

        setTimeout(() => {
          if (errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorSummaryRef.current.focus();
          }
        }, 100);
      }
    } catch (networkErr) {
      // Network or fetch failure
      setIsSubmitting(false);
      setServerError({
        message: 'Unable to reach the server. Please ensure your internet connection is active, or try again in a few moments.',
      });

      setTimeout(() => {
        if (errorSummaryRef.current) {
          errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorSummaryRef.current.focus();
        }
      }, 100);
    }
  };

  // Reset handler to allow submitting another enquiry
  const handleResetForm = () => {
    setSubmittedData(null);
    setServerError(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy reference code to clipboard with visual feedback
  const handleCopyReference = () => {
    if (!submittedData?.referenceCode) return;
    navigator.clipboard.writeText(submittedData.referenceCode).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2400);
    }).catch(() => {});
  };

  const errorList = Object.entries(errors);

  return (
    <main id="enquiry-page" className="enquiry-page">
      {/* ── HERO SECTION ── */}
      <section className="enquiry-hero" aria-label="Enquiry Introduction">
        <div className="enquiry-hero__bg" aria-hidden="true">
          <div className="enquiry-hero__orb enquiry-hero__orb--pink" />
          <div className="enquiry-hero__orb enquiry-hero__orb--gold" />
          <div className="enquiry-hero__grid" />
        </div>

        <div className="container enquiry-hero__content">
          <div className="section-label animate-fade-up">
            <span className="section-label__dot" aria-hidden="true" />
            Exhibitor & Partnership Portal
          </div>

          <h1 className="enquiry-hero__title animate-fade-up delay-100">
            Submit Your <span className="text-gradient">Enquiry</span>
          </h1>

          <p className="enquiry-hero__subtitle animate-fade-up delay-200">
            Planning to book an exhibition stall, propose a brand sponsorship, or perform at our next celebration?
            Share your requirements below and our organizing team will get in touch.
          </p>

          <div className="enquiry-trust-strip animate-fade-up delay-300" role="status">
            <div className="enquiry-trust-pill">
              <span className="enquiry-trust-icon" aria-hidden="true">✦</span>
              <span>Official Event Registry</span>
            </div>
            <div className="enquiry-trust-pill">
              <span className="enquiry-trust-icon" aria-hidden="true">📍</span>
              <span>Nashik Road Coordination Desk</span>
            </div>
            <div className="enquiry-trust-pill">
              <span className="enquiry-trust-icon" aria-hidden="true">🤝</span>
              <span>Dedicated Exhibitor Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT: SIDEBAR + FORM / CONFIRMATION ── */}
      <section className="enquiry-section" aria-label="Enquiry Form and Guidance">
        <div className="container enquiry-layout">

          {/* ── LEFT COLUMN: CATEGORIES & GUIDANCE ── */}
          <aside className="enquiry-info" aria-label="Enquiry Information and Guidance">
            <div className="enquiry-card-wrapper card">
              <h2 className="enquiry-sidebar-title">Enquiry Streams</h2>
              <p className="enquiry-sidebar-desc">
                Select the stream that best fits your requirement for prioritized routing:
              </p>

              <div className="enquiry-cat-list" role="list">
                {ENQUIRY_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="enquiry-cat-item" role="listitem">
                    <span className="enquiry-cat-icon" aria-hidden="true">{cat.icon}</span>
                    <div className="enquiry-cat-text">
                      <span className="enquiry-cat-name">{cat.label}</span>
                      <span className="enquiry-cat-detail">{cat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="enquiry-highlights">
                <div className="enquiry-highlight-item">
                  <span className="enquiry-highlight-bullet">✓</span>
                  <span><strong>Prime Exhibition Stalls:</strong> 3x3m and 2x2m spaces designed for artisans & creators.</span>
                </div>
                <div className="enquiry-highlight-item">
                  <span className="enquiry-highlight-bullet">✓</span>
                  <span><strong>Sponsorship Tiers:</strong> Title, Platinum, and Gold brand placement opportunities.</span>
                </div>
                <div className="enquiry-highlight-item">
                  <span className="enquiry-highlight-bullet">✓</span>
                  <span><strong>Direct Coordination:</strong> Personal assistance from our Nashik organizing team.</span>
                </div>
              </div>
            </div>

            {/* Confirmed Coordination Desk & WhatsApp Numbers */}
            <div className="enquiry-contact-ref">
              <h3 className="enquiry-contact-ref__title">
                <span>📍</span> Coordination Desk — Nashik Road
              </h3>
              <p className="enquiry-contact-ref__desc">
                For quick stall inquiries or urgent coordination, chat with our coordinators on WhatsApp at{' '}
                <a
                  href={`https://wa.me/91${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent('Hello Shree Sakhi Events, I would like to enquire about exhibition stalls.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enquiry-contact-ref__wa-link"
                >
                  {formatIndianPhone(COMPANY_INFO.whatsappNumbers[0])}
                </a>
                {' or '}
                <a
                  href={`https://wa.me/91${COMPANY_INFO.whatsappNumbers[1]}?text=${encodeURIComponent('Hello Shree Sakhi Events, I would like to enquire about exhibition stalls.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enquiry-contact-ref__wa-link"
                >
                  {formatIndianPhone(COMPANY_INFO.whatsappNumbers[1])}
                </a>.
              </p>
              <Link to="/contact" className="enquiry-contact-ref__link" id="enquiry-contact-link">
                View All Contact Channels →
              </Link>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: FORM OR PREMIUM CONFIRMATION SCREEN ── */}
          <div className="enquiry-main-col">
            {submittedData ? (
              /* ── PREMIUM SUBMISSION SUCCESS CONFIRMATION SCREEN ── */
              <div
                className="enquiry-success-experience animate-fade-in"
                ref={feedbackRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
              >
                <div className="enquiry-success-card card">
                  <div className="enquiry-success-glow" aria-hidden="true" />

                  {/* Header with Brand Seal & Reference Code */}
                  <div className="enquiry-success-header">
                    <div className="enquiry-success-seal">
                      <div className="enquiry-success-seal__ring" aria-hidden="true" />
                      <div className="enquiry-success-seal__icon" aria-hidden="true">
                        <CheckIcon />
                      </div>
                    </div>

                    <div className="enquiry-ref-badge-row">
                      <span className="enquiry-ref-tag">Official Enquiry Reference</span>
                      <div className="enquiry-ref-pill">
                        <span className="enquiry-ref-code">{submittedData.referenceCode}</span>
                        <button
                          type="button"
                          className={`enquiry-copy-btn ${copiedRef ? 'enquiry-copy-btn--copied' : ''}`}
                          onClick={handleCopyReference}
                          title="Copy reference code to clipboard"
                          aria-label="Copy reference code"
                        >
                          {copiedRef ? (
                            <>
                              <CheckIcon />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <CopyIcon />
                              <span>Copy Ref</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <h2 className="enquiry-success-title">
                      Enquiry Submitted <span className="text-gradient">Successfully</span>
                    </h2>

                    <p className="enquiry-success-lead">
                      Thank you, <strong>{submittedData.fullName}</strong>. Your enquiry details have been
                      successfully recorded in the Shree Sakhi Events database. Our coordination team
                      in Nashik has received your submission.
                    </p>
                  </div>

                  {/* 3-Step Milestone Pipeline */}
                  <div className="enquiry-timeline">
                    <div className="enquiry-timeline-title">Next Steps in the Process</div>
                    <div className="enquiry-timeline-grid">
                      <div className="enquiry-timeline-step enquiry-timeline-step--completed">
                        <div className="enquiry-timeline-step__marker">1</div>
                        <div className="enquiry-timeline-step__content">
                          <div className="enquiry-timeline-step__heading">Enquiry Recorded</div>
                          <div className="enquiry-timeline-step__desc">
                            Stored in event registry on {formatEnquiryDateTime(submittedData.createdAt)}.
                          </div>
                        </div>
                      </div>

                      <div className="enquiry-timeline-step enquiry-timeline-step--active">
                        <div className="enquiry-timeline-step__marker">2</div>
                        <div className="enquiry-timeline-step__content">
                          <div className="enquiry-timeline-step__heading">Desk Review & Allocation</div>
                          <div className="enquiry-timeline-step__desc">
                            Our team reviews your category requirements and checks space availability.
                          </div>
                        </div>
                      </div>

                      <div className="enquiry-timeline-step">
                        <div className="enquiry-timeline-step__marker">3</div>
                        <div className="enquiry-timeline-step__content">
                          <div className="enquiry-timeline-step__heading">Coordinator Connect</div>
                          <div className="enquiry-timeline-step__desc">
                            An official coordinator will reach out to <strong>{submittedData.phone}</strong> or by email.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Clarification Notice */}
                  <div className="enquiry-booking-notice">
                    <span className="enquiry-booking-notice__icon" aria-hidden="true">ℹ️</span>
                    <p className="enquiry-booking-notice__text">
                      <strong>Important Note:</strong> Submitting this enquiry logs your space and participation
                      request. It does not automatically confirm an exhibition stall booking. A confirmed reservation
                      is finalized after space allocation, document review, and formal booking completion.
                    </p>
                  </div>

                  {/* High-Contrast Structured Summary */}
                  <div className="enquiry-luxury-summary">
                    <div className="enquiry-luxury-summary__head">
                      <span>Verified Submission Summary</span>
                      <span className="enquiry-luxury-timestamp">
                        {formatEnquiryDateTime(submittedData.createdAt)}
                      </span>
                    </div>

                    <div className="enquiry-luxury-grid">
                      <div className="enquiry-luxury-item">
                        <span className="enquiry-luxury-label">Contact Person</span>
                        <span className="enquiry-luxury-val">{submittedData.fullName}</span>
                      </div>

                      <div className="enquiry-luxury-item">
                        <span className="enquiry-luxury-label">Company / Brand</span>
                        <span className="enquiry-luxury-val">
                          {submittedData.companyName || '— (Individual Participant)'}
                        </span>
                      </div>

                      <div className="enquiry-luxury-item">
                        <span className="enquiry-luxury-label">Email Address</span>
                        <span className="enquiry-luxury-val">{submittedData.email}</span>
                      </div>

                      <div className="enquiry-luxury-item">
                        <span className="enquiry-luxury-label">Phone Number</span>
                        <span className="enquiry-luxury-val">{submittedData.phone}</span>
                      </div>

                      <div className="enquiry-luxury-item enquiry-luxury-item--full">
                        <span className="enquiry-luxury-label">Enquiry Stream</span>
                        <span className="enquiry-luxury-val enquiry-luxury-val--highlight">
                          {submittedData.enquiryType}
                        </span>
                      </div>

                      <div className="enquiry-luxury-item enquiry-luxury-item--full">
                        <span className="enquiry-luxury-label">Requirements & Message</span>
                        <div className="enquiry-luxury-val enquiry-luxury-val--message">
                          {submittedData.message}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="enquiry-success-actions">
                    <a
                      href={`https://wa.me/91${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(`Hello Shree Sakhi Events, I have submitted Enquiry ${submittedData.referenceCode} regarding ${submittedData.enquiryType}. Looking forward to connecting.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp enquiry-wa-btn"
                      id="enquiry-success-wa-btn"
                    >
                      <WhatsAppIcon />
                      <span>Chat on WhatsApp ({submittedData.referenceCode})</span>
                    </a>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleResetForm}
                      id="enquiry-reset-btn"
                    >
                      Submit Another Enquiry
                    </button>

                    <Link to="/" className="btn btn-outline" id="enquiry-return-home-btn">
                      Return to Home
                    </Link>

                    <Link to="/events" className="btn btn-ghost" id="enquiry-browse-events-btn">
                      Explore Upcoming Events →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* ── INTERACTIVE ENQUIRY FORM ── */
              <div className="enquiry-form-card card">
                <div className="enquiry-form-header">
                  <h2 className="enquiry-form-title">
                    Enquiry & <span className="text-gradient">Space Reservation</span>
                  </h2>
                  <p className="enquiry-form-subtitle">
                    Please provide accurate contact and requirement details.
                  </p>
                  <p className="enquiry-form-legend">
                    Fields marked with <span className="req" aria-hidden="true">*</span> are required.
                  </p>
                </div>

                {/* Server / Network Error Alert Banner */}
                {serverError && (
                  <div
                    className="enquiry-server-error-banner"
                    role="alert"
                    aria-live="assertive"
                    ref={errorSummaryRef}
                    tabIndex={-1}
                  >
                    <div className="enquiry-server-error-main">
                      <span className="enquiry-server-error-icon" aria-hidden="true">⚠️</span>
                      <div className="enquiry-server-error-body">
                        <strong className="enquiry-server-error-title">Submission Error</strong>
                        <p className="enquiry-server-error-text">
                          {typeof serverError === 'string' ? serverError : serverError.message}
                        </p>
                        {serverError.details && Array.isArray(serverError.details) && (
                          <ul className="enquiry-server-error-list">
                            {serverError.details.map((msg, i) => (
                              <li key={i}>{msg}</li>
                            ))}
                          </ul>
                        )}
                        <span className="enquiry-server-error-hint">
                          Your entered details have been preserved below. Please correct any highlighted fields and try submitting again.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="enquiry-server-error-close"
                        onClick={() => setServerError(null)}
                        aria-label="Close error notice"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Client Validation Error Summary Banner */}
                {errorList.length > 0 && !serverError && (
                  <div
                    className="enquiry-error-banner"
                    role="alert"
                    aria-live="assertive"
                    ref={errorSummaryRef}
                    tabIndex={-1}
                  >
                    <span className="enquiry-error-banner__icon" aria-hidden="true">⚠️</span>
                    <div className="enquiry-error-banner__content">
                      <div className="enquiry-error-banner__title">
                        Please resolve the following {errorList.length} issue{errorList.length > 1 ? 's' : ''}:
                      </div>
                      <ul className="enquiry-error-banner__list">
                        {errorList.map(([key, msg]) => (
                          <li key={key}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate aria-label="Shree Sakhi Events Enquiry Form">
                  {/* Row 1: Full Name & Company Name */}
                  <div className="enquiry-form-grid">
                    <div className="enquiry-form-group">
                      <label htmlFor="enquiry-fullname" className="form-label">
                        Full Name <span className="req" aria-hidden="true">*</span>
                      </label>
                      <div className="enquiry-input-wrapper">
                        <span className="enquiry-input-icon" aria-hidden="true">
                          <UserIcon />
                        </span>
                        <input
                          ref={fullNameRef}
                          id="enquiry-fullname"
                          name="fullName"
                          type="text"
                          className={`form-input enquiry-form-input ${errors.fullName ? 'error' : ''}`}
                          placeholder="e.g. Priyadarshini Patil"
                          value={form.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                          aria-required="true"
                          aria-invalid={!!errors.fullName}
                          aria-describedby={errors.fullName ? 'enquiry-fullname-error' : undefined}
                          autoComplete="name"
                        />
                      </div>
                      {errors.fullName && (
                        <div id="enquiry-fullname-error" className="enquiry-field-error" role="alert">
                          <AlertCircleIcon />
                          <span>{errors.fullName}</span>
                        </div>
                      )}
                    </div>

                    <div className="enquiry-form-group">
                      <label htmlFor="enquiry-company" className="form-label">
                        Company / Brand Name <span className="form-label-opt">(Optional)</span>
                      </label>
                      <div className="enquiry-input-wrapper">
                        <span className="enquiry-input-icon" aria-hidden="true">
                          <BuildingIcon />
                        </span>
                        <input
                          ref={companyRef}
                          id="enquiry-company"
                          name="companyName"
                          type="text"
                          className={`form-input enquiry-form-input ${errors.companyName ? 'error' : ''}`}
                          placeholder="e.g. Sakhi Handlooms & Crafts"
                          value={form.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                          aria-invalid={!!errors.companyName}
                          aria-describedby={errors.companyName ? 'enquiry-company-error' : undefined}
                          autoComplete="organization"
                        />
                      </div>
                      {errors.companyName && (
                        <div id="enquiry-company-error" className="enquiry-field-error" role="alert">
                          <AlertCircleIcon />
                          <span>{errors.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div className="enquiry-form-grid">
                    <div className="enquiry-form-group">
                      <label htmlFor="enquiry-email" className="form-label">
                        Email Address <span className="req" aria-hidden="true">*</span>
                      </label>
                      <div className="enquiry-input-wrapper">
                        <span className="enquiry-input-icon" aria-hidden="true">
                          <EmailIcon />
                        </span>
                        <input
                          ref={emailRef}
                          id="enquiry-email"
                          name="email"
                          type="email"
                          className={`form-input enquiry-form-input ${errors.email ? 'error' : ''}`}
                          placeholder="e.g. name@example.com"
                          value={form.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && (
                        <div id="enquiry-email-error" className="enquiry-field-error" role="alert">
                          <AlertCircleIcon />
                          <span>{errors.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="enquiry-form-group">
                      <label htmlFor="enquiry-phone" className="form-label">
                        Phone Number <span className="req" aria-hidden="true">*</span>
                      </label>
                      <div className="enquiry-input-wrapper">
                        <span className="enquiry-input-icon" aria-hidden="true">
                          <PhoneIcon />
                        </span>
                        <input
                          ref={phoneRef}
                          id="enquiry-phone"
                          name="phone"
                          type="tel"
                          className={`form-input enquiry-form-input ${errors.phone ? 'error' : ''}`}
                          placeholder="e.g. 9876543210 (10 digits)"
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                          aria-required="true"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'enquiry-phone-error' : 'enquiry-phone-hint'}
                          autoComplete="tel"
                        />
                      </div>
                      <span id="enquiry-phone-hint" className="enquiry-field-hint">
                        10-digit mobile number for calls & WhatsApp coordination
                      </span>
                      {errors.phone && (
                        <div id="enquiry-phone-error" className="enquiry-field-error" role="alert">
                          <AlertCircleIcon />
                          <span>{errors.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Enquiry Type Selection */}
                  <div className="enquiry-form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                    <label htmlFor="enquiry-type" className="form-label">
                      Enquiry Category / Stream <span className="req" aria-hidden="true">*</span>
                    </label>
                    <div className="enquiry-select-wrapper">
                      <span className="enquiry-input-icon" aria-hidden="true">
                        <TagIcon />
                      </span>
                      <select
                        ref={enquiryTypeRef}
                        id="enquiry-type"
                        name="enquiryType"
                        className={`form-input enquiry-form-input ${errors.enquiryType ? 'error' : ''}`}
                        value={form.enquiryType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        aria-required="true"
                        aria-invalid={!!errors.enquiryType}
                        aria-describedby={errors.enquiryType ? 'enquiry-type-error' : undefined}
                      >
                        <option value="">-- Please select an enquiry category --</option>
                        {ENQUIRY_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.label}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                      <span className="enquiry-select-arrow" aria-hidden="true">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.enquiryType && (
                      <div id="enquiry-type-error" className="enquiry-field-error" role="alert">
                        <AlertCircleIcon />
                        <span>{errors.enquiryType}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Message */}
                  <div className="enquiry-form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div className="enquiry-textarea-header">
                      <label htmlFor="enquiry-message" className="form-label">
                        Message & Requirements <span className="req" aria-hidden="true">*</span>
                      </label>
                      <span
                        className={`enquiry-char-counter ${form.message.length > 900 ? 'enquiry-char-counter--limit' : ''}`}
                        aria-live="polite"
                      >
                        {form.message.length} / 1000 characters
                      </span>
                    </div>
                    <textarea
                      ref={messageRef}
                      id="enquiry-message"
                      name="message"
                      rows={5}
                      maxLength={1000}
                      className={`form-input enquiry-textarea ${errors.message ? 'error' : ''}`}
                      placeholder="Please specify stall dimensions, products to showcase, target dates, or specific questions..."
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
                    />
                    {errors.message && (
                      <div id="enquiry-message-error" className="enquiry-field-error" role="alert">
                        <AlertCircleIcon />
                        <span>{errors.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Privacy / Consent Status Note */}
                  <div className="enquiry-consent-note">
                    <span className="enquiry-consent-note__icon" aria-hidden="true">🔒</span>
                    <div>
                      <strong>Privacy Assurance:</strong> Your contact information will be used exclusively
                      by the Shree Sakhi Events organizing desk to communicate regarding this exhibition enquiry.
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="enquiry-form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary enquiry-submit-btn"
                      disabled={isSubmitting}
                      id="enquiry-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="enquiry-spinner" aria-hidden="true" />
                          <span>Saving to Registry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Official Enquiry</span>
                          <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost enquiry-reset-btn"
                      disabled={isSubmitting}
                      onClick={() => {
                        setForm(INITIAL_FORM);
                        setErrors({});
                        setTouched({});
                        setServerError(null);
                      }}
                      id="enquiry-clear-btn"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}

/* ── Inline Accessible SVGs ── */

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}


function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
