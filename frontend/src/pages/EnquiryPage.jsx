import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './EnquiryPage.css';

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

  // 2. Company Name (Optional, but length bounded)
  const trimmedCompany = (formValues.companyName || '').trim();
  if (trimmedCompany.length > 100) {
    errors.companyName = 'Company / organization name cannot exceed 100 characters.';
  }

  // 3. Email
  const trimmedEmail = (formValues.email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
  }

  // 4. Phone Number (10 digits expected for Indian mobile/landline numbers)
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
  const [submittedData, setSubmittedData] = useState(null);

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

    // Live validation update for touched fields
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

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

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

      // Accessibility: focus the first invalid field or error summary
      const errorFieldKeys = ['fullName', 'companyName', 'email', 'phone', 'enquiryType', 'message'];
      const firstInvalidField = errorFieldKeys.find(key => validationErrors[key]);

      if (firstInvalidField && fieldRefs[firstInvalidField]?.current) {
        fieldRefs[firstInvalidField].current.focus();
      } else if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }
      return;
    }

    // No client validation errors
    setErrors({});
    setIsSubmitting(true);

    // Frontend validation stage simulation:
    // Strictly adheres to Requirement 9: No fake success claim, no claim that email
    // has been sent or data saved to DB. Clearly handles this as a frontend-validated stage.
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...form });

      // Smooth scroll to feedback area
      if (feedbackRef.current) {
        feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
  };

  // Reset handler to allow multiple test rounds or edits
  const handleResetForm = () => {
    setSubmittedData(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

          {/* Frontend Stage Notice Banner */}
          <div className="enquiry-stage-notice animate-fade-up delay-300" role="status">
            <span className="enquiry-stage-notice__icon" aria-hidden="true">💡</span>
            <div className="enquiry-stage-notice__text">
              <strong>Frontend Verification Stage:</strong> This form performs full client-side validation
              and structural accessibility checks. The backend integration (<code>POST /api/enquiries</code>)
              is scheduled in the next sprint.
              <span className="enquiry-stage-notice__tag">Frontend Only</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT: SIDEBAR + FORM / FEEDBACK ── */}
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
                  <span><strong>Response Window:</strong> 24 to 48 working hours upon backend integration activation.</span>
                </div>
              </div>
            </div>

            {/* Verification & Contact Reference (Adheres to Rule 13: No hardcoded unverified numbers) */}
            <div className="enquiry-contact-ref">
              <h3 className="enquiry-contact-ref__title">
                <span>📍</span> Coordination Desk — Nashik
              </h3>
              <p className="enquiry-contact-ref__desc">
                Direct phone helpline and WhatsApp coordination numbers are undergoing administrative
                verification against company records. Visit our Contact page to view current verification status.
              </p>
              <Link to="/contact" className="enquiry-contact-ref__link" id="enquiry-contact-link">
                View Contact Verification Status →
              </Link>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: FORM OR FEEDBACK ── */}
          <div className="enquiry-main-col">
            {submittedData ? (
              /* ── FRONTEND VALIDATED FEEDBACK VIEW ── */
              <div
                className="enquiry-feedback-area"
                ref={feedbackRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
              >
                <div className="enquiry-feedback-card card">
                  <div className="enquiry-feedback-badge-row">
                    <span className="enquiry-feedback-badge">
                      <CheckIcon /> Client Validation Passed
                    </span>
                    <span className="enquiry-feedback-badge enquiry-feedback-badge--stage">
                      Frontend Stage
                    </span>
                  </div>

                  <h2 className="enquiry-feedback-title">
                    Enquiry Details <span className="text-gradient">Ready for Dispatch</span>
                  </h2>

                  <p className="enquiry-feedback-lead">
                    Thank you, <strong>{submittedData.fullName}</strong>. All required fields have met the
                    formatting and validation constraints for Shree Sakhi Events.
                  </p>

                  {/* Explicit Backend Status Notice (Requirement 9) */}
                  <div className="enquiry-backend-alert">
                    <span className="enquiry-backend-alert__icon" aria-hidden="true">⚠️</span>
                    <div className="enquiry-backend-alert__content">
                      <strong>Frontend-Only Milestone:</strong> The backend endpoint{' '}
                      <code className="enquiry-backend-alert__code">POST /api/enquiries</code> is not yet connected.
                      No database record has been created, and no automated confirmation email has been dispatched.
                      Your entered data is displayed below as verified on the client:
                    </div>
                  </div>

                  {/* Summary of Validated Submission */}
                  <div className="enquiry-summary-box">
                    <div className="enquiry-summary-heading">Validated Payload Summary</div>
                    <div className="enquiry-summary-grid">
                      <div className="enquiry-summary-field">
                        <span className="enquiry-summary-label">Full Name</span>
                        <span className="enquiry-summary-val">{submittedData.fullName}</span>
                      </div>

                      <div className="enquiry-summary-field">
                        <span className="enquiry-summary-label">Company / Brand</span>
                        <span className="enquiry-summary-val">
                          {submittedData.companyName || '— (Individual Participant)'}
                        </span>
                      </div>

                      <div className="enquiry-summary-field">
                        <span className="enquiry-summary-label">Email Address</span>
                        <span className="enquiry-summary-val">{submittedData.email}</span>
                      </div>

                      <div className="enquiry-summary-field">
                        <span className="enquiry-summary-label">Phone Number</span>
                        <span className="enquiry-summary-val">{submittedData.phone}</span>
                      </div>

                      <div className="enquiry-summary-field enquiry-summary-field--full">
                        <span className="enquiry-summary-label">Enquiry Stream</span>
                        <span className="enquiry-summary-val" style={{ color: 'var(--color-gold-light)' }}>
                          {submittedData.enquiryType}
                        </span>
                      </div>

                      <div className="enquiry-summary-field enquiry-summary-field--full">
                        <span className="enquiry-summary-label">Enquiry Message</span>
                        <div className="enquiry-summary-val enquiry-summary-val--message">
                          {submittedData.message}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="enquiry-feedback-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleResetForm}
                      id="enquiry-reset-btn"
                    >
                      Fill Another Enquiry Form
                    </button>
                    <Link to="/events" className="btn btn-outline" id="enquiry-browse-events-btn">
                      Explore Upcoming Events →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* ── INTERACTIVE ENQUIRY FORM ── */
              <div className="enquiry-form-card card glass">
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

                {/* Accessibility Error Summary Banner */}
                {errorList.length > 0 && (
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
                        Company / Brand Name <span className="form-label-opt" style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>(Optional)</span>
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
                          aria-required="true"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'enquiry-phone-error' : 'enquiry-phone-hint'}
                          autoComplete="tel"
                        />
                      </div>
                      <span id="enquiry-phone-hint" className="enquiry-field-hint">
                        10-digit mobile number for WhatsApp & call updates
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
                      placeholder="Please specify stall size needs, product types, target event dates, sponsorship interests, or general questions..."
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
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

                  {/* Privacy / Consent Status Note (Adheres to Rule 10: Do not invent legal terms) */}
                  <div className="enquiry-consent-note">
                    <span className="enquiry-consent-note__icon" aria-hidden="true">🔒</span>
                    <div>
                      <strong>Privacy Notice:</strong> Official company data privacy policy wording is
                      currently pending legal confirmation from administration. Submitted contact details will
                      be used exclusively for organizing team communication regarding this event inquiry.
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
                          <span>Validating Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enquiry</span>
                          <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost enquiry-reset-btn"
                      onClick={() => {
                        setForm(INITIAL_FORM);
                        setErrors({});
                        setTouched({});
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
