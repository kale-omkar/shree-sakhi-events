import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getStalls, holdStalls, releaseHold } from '../api/stallApi';
import StepIndicator from '../components/StepIndicator';

/**
 * Interactive SVG-based Stall Selection — RedBus / BookMyShow style.
 *
 * Floor plan layout is driven entirely by live backend data (posX, posY, width, height
 * seeded from the reference floor plan image). Category/price come from CATEGORY_SPEC.
 * Live status (AVAILABLE / HELD / BOOKED) is fetched from the backend and overlaid.
 *
 * Session id is persisted in sessionStorage so holds survive refresh within the tab.
 * Stall status is polled every 15s to keep the map current.
 */
const CELL = 56; // base SVG grid cell size (px)
const AISLE = 16; // gap between grid cells
const POLL_INTERVAL_MS = 15000;
const MAX_SELECTION_WARN = 5;

// Category spec — matches the reference floor plan legend exactly.
const CATEGORY_SPEC = {
  PREMIUM: { label: 'Premium', color: '#E67E22', price: 5000 },   // Orange
  REGULAR: { label: 'Regular', color: '#F1C40F', price: 4000 },   // Yellow
  CLASSIC: { label: 'Classic', color: '#2ECC71', price: 4000 },   // Light Green
  SINGLE_TABLE: { label: 'Single Table', color: '#3498DB', price: 2500 }, // Blue
};

// Distinct status colors (not category colors)
const STATUS_COLORS = {
  SELECTED: '#27AE60',   // Green — selected by you
  HELD: '#F39C12',       // Amber — temporarily reserved
  BOOKED: '#C0392B',     // Red — already booked
};

const FACILITY_COLOR = '#95A5A6';

// Non-bookable facility blocks drawn on the floor plan (positions in grid cells).
// These match the reference floor plan: STAGE top-center, ENTRY/EXIT sides, ORG/STAIR bottom.
const FACILITIES = [
  { id: 'fac-stage', label: 'STAGE', gx: 3, gy: 0, w: 6, h: 1 },
  { id: 'fac-entry', label: 'ENTRY', gx: 0, gy: 2, w: 1, h: 2 },
  { id: 'fac-exit', label: 'EXIT', gx: 11, gy: 2, w: 1, h: 2 },
  { id: 'fac-org', label: 'ORG', gx: 0, gy: 13, w: 2, h: 1 },
  { id: 'fac-stair', label: 'STAIR', gx: 10, gy: 13, w: 2, h: 1 },
];

// Parse a "LxW" size label into { length, width }.
const parseSize = (label) => {
  if (!label) return { length: 10, width: 7 };
  const m = String(label).match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (m) return { length: Number(m[1]), width: Number(m[2]) };
  return { length: 10, width: 7 };
};

export default function StallSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  // Flow state persisted across steps
  const [flow, setFlow] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('booking_flow') || 'null');
    } catch { return null; }
  });

  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('stall_session_id');
    if (!id) {
      id = 'ss_' + Math.random().toString(36).slice(2);
      sessionStorage.setItem('stall_session_id', id);
    }
    return id;
  });

  const [stalls, setStalls] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [hold, setHold] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // stall detail popup
  const [timer, setTimer] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const eventId = flow?.eventId ? Number(flow.eventId) : (location.state?.eventId || null);
  const bookerType = flow?.bookerType || location.state?.bookerType || 'VISITOR';
  const requiresStalls = bookerType === 'EXHIBITOR' || bookerType === 'SPONSOR';

  useEffect(() => {
    if (flow) sessionStorage.setItem('booking_flow', JSON.stringify(flow));
  }, [flow]);

  useEffect(() => {
    if (eventId && (!flow || flow.eventId !== String(eventId))) {
      setFlow({ eventId: String(eventId), bookerType, stallCodes: [], holdToken: null, sessionId });
    }
  }, [eventId, flow, bookerType]);

  // Fetch stalls from backend — positions (posX/posY/width/height) come from the seeded floor plan.
  const fetchStalls = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStalls(eventId, sessionId);
      const list = Array.isArray(data) ? data : [];
      setStalls(list);
    } catch (err) {
      setError(err.message || 'Failed to load stall map. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [eventId, sessionId]);

  useEffect(() => {
    fetchStalls();
    pollRef.current = setInterval(fetchStalls, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchStalls]);

  // Countdown timer while a hold is active
  useEffect(() => {
    if (!hold) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
      return;
    }
    const expiry = new Date(hold.expiresAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining <= 0) handleHoldExpiry();
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hold]);

  const handleHoldExpiry = async () => {
    setError('Your stall hold has expired. Please re-select your stalls.');
    try {
      if (hold?.holdToken) await releaseHold({ holdToken: hold.holdToken });
    } catch { /* ignore */ }
    setHold(null);
    setTimer(0);
    setSelected(new Set());
    setFlow(prev => ({ ...prev, stallCodes: [], holdToken: null }));
  };

  // Build a live status map keyed by stall code
  const statusMap = new Map();
  stalls.forEach(s => statusMap.set(s.stallCode, s.status));

  // Look up stall info from backend data + category spec
  const getStallInfo = (code) => {
    const live = stalls.find(s => s.stallCode === code);
    if (!live) return null;
    const catSpec = CATEGORY_SPEC[live.stallType] || CATEGORY_SPEC.REGULAR;
    const size = parseSize(live.sizeLabel);
    return {
      code: live.stallCode,
      category: live.stallType,
      label: catSpec.label,
      color: catSpec.color,
      price: live.price != null ? Number(live.price) : catSpec.price,
      length: size.length,
      width: size.width,
      area: size.length * size.width,
      posX: live.posX != null ? Number(live.posX) : 0,
      posY: live.posY != null ? Number(live.posY) : 0,
      gridW: live.width != null ? Number(live.width) : 1,
      gridH: live.height != null ? Number(live.height) : 1,
      status: live.status || 'AVAILABLE',
    };
  };

  const toggleStall = (code) => {
    if (hold) return; // locked while a hold is active
    if (!requiresStalls) return;
    const info = getStallInfo(code);
    if (!info || info.status !== 'AVAILABLE') return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    setError(null);
    setDetail(null);
  };

  const selectStall = (code) => {
    if (!requiresStalls) return;
    const info = getStallInfo(code);
    if (!info || info.status !== 'AVAILABLE') return;
    setDetail(info);
  };

  const selectedStalls = stalls.filter(s => selected.has(s.stallCode));
  const subtotal = selectedStalls.reduce((sum, s) => {
    const spec = CATEGORY_SPEC[s.stallType] || CATEGORY_SPEC.REGULAR;
    return sum + spec.price;
  }, 0);
  const totalArea = selectedStalls.reduce((sum, s) => {
    const size = parseSize(s.sizeLabel);
    return sum + (size.length * size.width);
  }, 0);

  const canProceed = selectedStalls.length > 0;
  const exceedsLimit = selectedStalls.length > MAX_SELECTION_WARN;

  const handleProceed = async () => {
    if (!canProceed || !eventId) return;
    if (exceedsLimit) {
      setError(`Maximum ${MAX_SELECTION_WARN} stalls can be selected per booking.`);
      return;
    }
    setError(null);
    try {
      const payload = {
        eventId: Number(eventId),
        stallCodes: Array.from(selected),
        sessionId,
      };
      const res = await holdStalls(payload);
      setFlow(prev => ({ ...prev, stallCodes: Array.from(selected), holdToken: res.holdToken, sessionId }));
      setHold({
        holdToken: res.holdToken,
        expiresAt: res.expiresAt,
        total: res.total,
        heldStalls: res.heldStalls || [],
      });
      setSelected(new Set(Array.from(selected)));
    } catch (err) {
      const msg = err.message || 'Hold failed. Please try again.';
      if (msg.includes('409') || msg.includes('conflict') || msg.includes('already')) {
        setError('Stall just got booked by another user, please choose another.');
      } else {
        setError(msg);
      }
      await fetchStalls();
    }
  };

  const handleRelease = async () => {
    setError(null);
    try {
      if (hold?.holdToken) await releaseHold({ holdToken: hold.holdToken });
    } catch { /* ignore */ }
    setHold(null);
    setTimer(0);
    setSelected(new Set());
    setFlow(prev => ({ ...prev, stallCodes: [], holdToken: null, sessionId }));
    setDetail(null);
  };

  const handleContinueToDetails = () => {
    if (!hold) return;
    navigate('/book/details', {
      state: {
        eventId: Number(eventId),
        bookerType,
        stallCodes: Array.from(selected),
        holdToken: hold.holdToken,
        amount: hold.total,
        sessionId,
      },
    });
  };

  const handleBack = () => {
    if (hold?.holdToken) {
      releaseHold({ holdToken: hold.holdToken }).catch(() => {});
    }
    setHold(null);
    setSelected(new Set());
    setDetail(null);
    navigate('/book');
  };

  const handleClear = () => {
    setSelected(new Set());
    setDetail(null);
    setError(null);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.6));
  const handleReset = () => setZoom(1);

  const completed = new Set([1]);
  if (flow?.stallCodes && flow.stallCodes.length > 0) completed.add(2);

  // SVG dimensions from backend positions (grid cells)
  const allItems = [...stalls, ...FACILITIES];
  const maxGx = Math.max(
    ...allItems.map(i => (i.posX != null ? i.posX : i.gx) + (i.width != null ? i.width : i.w)),
    0
  );
  const maxGy = Math.max(
    ...allItems.map(i => (i.posY != null ? i.posY : i.gy) + (i.height != null ? i.height : i.h)),
    0
  );
  const svgWidth = (maxGx + 2) * (CELL + AISLE);
  const svgHeight = (maxGy + 3) * (CELL + AISLE);

  if (loading) {
    return (
      <main className="stall-page">
        <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
          <StepIndicator current={2} completed={completed} />
          <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>Select Your Stall(s)</h1>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, display: 'inline-block' }} />
          </div>
        </div>
      </main>
    );
  }

  if (error && stalls.length === 0 && !hold) {
    return (
      <main className="stall-page">
        <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
          <StepIndicator current={2} completed={completed} />
          <h1>Select Your Stall(s)</h1>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-error)' }}>
            {error}
            <br /><br />
            <button className="btn btn-outline" onClick={fetchStalls}>Retry</button>
            {'  '}
            <Link to="/book" className="btn btn-ghost">Back to Event</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="stall-page" id="stall-selection-page">
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <StepIndicator current={2} completed={completed} />

        <header className="stall-header">
          <Link to="/book" className="stall-back" onKeyDown={e => e.key === 'Enter' && handleBack()}>&larr; Back to Event</Link>
          <div>
            <h1>Book Your Stall</h1>
            <p>Select your preferred exhibition space on the interactive floor plan.</p>
          </div>
        </header>

        {/* ── Category Legend ── */}
        <div className="stall-legend">
          <span className="legend-title">Stall Categories</span>
          {Object.entries(CATEGORY_SPEC).map(([key, spec]) => (
            <div key={key} className="legend-item">
              <span className="legend-swatch" style={{ backgroundColor: spec.color }} aria-hidden="true" />
              <span>{spec.label}</span>
              <span className="legend-price">₹{spec.price.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="legend-item legend-item--facility">
            <span className="legend-swatch" style={{ backgroundColor: FACILITY_COLOR }} aria-hidden="true" />
            <span>Facility (non-bookable)</span>
          </div>
          <div className="legend-item legend-item--status">
            <span className="legend-swatch legend-swatch--selected" aria-hidden="true" />
            <span>Selected by you</span>
          </div>
          <div className="legend-item legend-item--status">
            <span className="legend-swatch legend-swatch--held" aria-hidden="true" />
            <span>Temporarily reserved</span>
          </div>
          <div className="legend-item legend-item--status">
            <span className="legend-swatch legend-swatch--booked" aria-hidden="true" />
            <span>Already booked</span>
          </div>
        </div>

        {error && (
          <div className="stall-error" role="alert">⚠️ {error}</div>
        )}

        {!requiresStalls && (
          <div className="stall-visitor-note">
            Visitors do not require stalls. Proceed without selecting any.
            <button className="btn btn-primary" onClick={handleContinueToDetails} disabled={!hold}>
              Continue to Details →
            </button>
          </div>
        )}

        {/* ── Main: Floor Plan + Summary ── */}
        <div className="stall-main">
          {/* LEFT: Floor Plan */}
          <section className="stall-map-section">
            <div className="stall-map-controls">
              <button className="btn btn-outline btn-sm" onClick={handleZoomOut} title="Zoom out">− Zoom Out</button>
              <button className="btn btn-outline btn-sm" onClick={handleReset} title="Reset view">Reset View</button>
              <button className="btn btn-outline btn-sm" onClick={handleZoomIn} title="Zoom in">Zoom In +</button>
              <button className="btn btn-outline btn-sm" onClick={handleClear} title="Clear selection">Clear Selection</button>
              <span className="zoom-indicator">{(zoom * 100).toFixed(0)}%</span>
            </div>

            <div className="stall-map-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="stall-svg"
                role="graphics-document"
                aria-label="Exhibition floor plan"
              >
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.25" />
                  </filter>
                </defs>

                {/* ── Facility Blocks (non-bookable) ── */}
                {FACILITIES.map(fac => {
                  const x = fac.gx * (CELL + AISLE);
                  const y = (fac.gy + 1) * (CELL + AISLE);
                  const w = fac.w * (CELL + AISLE) - AISLE;
                  const h = fac.h * (CELL + AISLE) - AISLE;
                  return (
                    <g key={fac.id} className="facility-group">
                      <rect
                        x={x} y={y} width={w} height={h}
                        className="facility-rect"
                        fill={FACILITY_COLOR}
                        stroke="#7F8C8D"
                        strokeWidth="2"
                        rx="6"
                        filter="url(#shadow)"
                      />
                      <text
                        x={x + w / 2} y={y + h / 2 + 5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="800"
                        fontFamily="var(--font-ui)"
                        pointerEvents="none"
                      >
                        {fac.label}
                      </text>
                    </g>
                  );
                })}

                {/* ── Stalls ── */}
                {stalls.map(stall => {
                  const info = getStallInfo(stall.stallCode);
                  const isSelected = selected.has(stall.stallCode);
                  const isHeldByUs = hold && hold.heldStalls.some(h => h.stallCode === stall.stallCode);
                  const catColor = info ? info.color : '#95A5A6';

                  let stateClass = 'available';
                  let isInteractive = true;
                  let cursor = 'pointer';
                  if (info.status === 'BOOKED') { stateClass = 'booked'; isInteractive = false; cursor = 'not-allowed'; }
                  else if (info.status === 'HELD' && !isHeldByUs) { stateClass = 'held'; isInteractive = false; cursor = 'not-allowed'; }
                  else if (isSelected || isHeldByUs) { stateClass = 'selected'; }

                  const x = info.posX * (CELL + AISLE);
                  const y = (info.posY + 1) * (CELL + AISLE);
                  const w = info.gridW * (CELL + AISLE) - AISLE;
                  const h = Math.max(CELL, info.gridH * (CELL + AISLE) - AISLE);

                  const fillColor = stateClass === 'selected'
                    ? STATUS_COLORS.SELECTED
                    : stateClass === 'booked'
                    ? STATUS_COLORS.BOOKED
                    : stateClass === 'held'
                    ? STATUS_COLORS.HELD
                    : catColor;

                  const strokeColor = stateClass === 'selected'
                    ? '#1E8449'
                    : stateClass === 'booked'
                    ? '#7B241C'
                    : stateClass === 'held'
                    ? '#B9770E'
                    : '#34495E';

                  return (
                    <g
                      key={stall.stallCode}
                      className={`stall-group stall-${stateClass}`}
                      transform={`translate(${x},${y})`}
                    >
                      <rect
                        x={0} y={0} width={w} height={h}
                        className={`stall-rect stall-rect--${stateClass}`}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={stateClass === 'selected' ? 3 : 2}
                        rx={6}
                        filter={stateClass === 'selected' ? 'url(#shadow)' : 'none'}
                        onClick={isInteractive ? () => toggleStall(stall.stallCode) : () => selectStall(stall.stallCode)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (isInteractive) toggleStall(stall.stallCode);
                            else selectStall(stall.stallCode);
                          }
                        }}
                        tabIndex={isInteractive ? 0 : -1}
                        role="button"
                        aria-label={`Stall ${stall.stallCode}, ${info.label}, ₹${info.price.toLocaleString('en-IN')}, ${info.status}`}
                        aria-pressed={isSelected}
                        style={{ cursor }}
                      />
                      <text
                        x={w / 2} y={h / 2 - 6}
                        textAnchor="middle"
                        fill={stateClass === 'booked' ? '#95A5A6' : '#FFFFFF'}
                        fontSize="12"
                        fontWeight="800"
                        fontFamily="var(--font-display)"
                        pointerEvents="none"
                        letterSpacing="0.05em"
                      >
                        {stall.stallCode}
                      </text>
                      {isSelected && (
                        <text
                          x={w / 2} y={h / 2 + 10}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="var(--font-ui)"
                          pointerEvents="none"
                          opacity="0.95"
                        >
                          ✔
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="stall-map-footer">
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Each stall is individually clickable. Green check = selected. Amber = temporarily reserved. Red = already booked.
              </p>
            </div>
          </section>

          {/* RIGHT: Booking Summary */}
          <aside className="stall-summary">
            <div className="stall-summary__title">
              {hold ? 'Hold Active' : 'Booking Summary'}
            </div>

            {hold ? (
              <div className="stall-summary__timer">
                Hold expires in {Math.floor(timer / 60)}m {timer % 60}s
                {timer <= 0 && <span style={{ color: 'var(--color-error)' }}> — releasing…</span>}
              </div>
            ) : null}

            {detail && (
              <div className="stall-detail-panel">
                <button className="stall-detail__close" onClick={() => setDetail(null)}>&times;</button>
                <div className="stall-detail__header">
                  <span className="stall-detail__code">Stall {detail.code}</span>
                  <span className="stall-detail__category" style={{ color: detail.color }}>
                    {detail.label}
                  </span>
                </div>
                <div className="stall-detail__grid">
                  <div className="stall-detail__row">
                    <span className="stall-detail__label">Dimensions</span>
                    <span className="stall-detail__value">{detail.length} ft × {detail.width} ft</span>
                  </div>
                  <div className="stall-detail__row">
                    <span className="stall-detail__label">Area</span>
                    <span className="stall-detail__value">{detail.area} sq. ft.</span>
                  </div>
                  <div className="stall-detail__row">
                    <span className="stall-detail__label">Price</span>
                    <span className="stall-detail__value">₹{detail.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="stall-detail__row">
                    <span className="stall-detail__label">Status</span>
                    <span className={`stall-detail__status stall-detail__status--${detail.status}`}>
                      {detail.status === 'AVAILABLE' ? 'Available' : detail.status === 'HELD' ? 'Reserved' : 'Booked'}
                    </span>
                  </div>
                </div>
                {detail.status === 'AVAILABLE' && (
                  <button
                    className="btn btn-primary stall-detail__select"
                    onClick={() => { toggleStall(detail.code); }}
                    disabled={exceedsLimit}
                  >
                    {exceedsLimit ? `Max ${MAX_SELECTION_WARN} stalls` : 'Select Stall'}
                  </button>
                )}
                {detail.status === 'BOOKED' && (
                  <div className="stall-detail__booked">Already booked — please choose another stall.</div>
                )}
              </div>
            )}

            {selectedStalls.length > 0 ? (
              <div className="stall-summary__list">
                <div className="stall-summary__header">
                  <span>Selected ({selectedStalls.length})</span>
                  <span>Total</span>
                </div>
                {selectedStalls.map(s => {
                  const info = getStallInfo(s.stallCode);
                  const price = info ? info.price : 0;
                  const size = parseSize(s.sizeLabel);
                  const area = size.length * size.width;
                  return (
                    <div key={s.stallCode} className="stall-summary__item">
                      <div className="stall-summary__item__info">
                        <span className="stall-summary__item__code">Stall {s.stallCode}</span>
                        <span className="stall-summary__item__meta">
                          {info ? info.label : s.stallType} • {size.length}×{size.width}ft • {area} sq.ft.
                        </span>
                      </div>
                      <span className="stall-summary__item__price">₹{price.toLocaleString('en-IN')}</span>
                      <button
                        className="stall-summary__item__remove"
                        onClick={() => toggleStall(s.stallCode)}
                        title={`Remove stall ${s.stallCode}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="stall-summary__empty">No stalls selected</div>
            )}

            <div className="stall-summary__divider" />
            <div className="stall-summary__total">
              <div className="stall-summary__total__row">
                <span>Total Stalls</span>
                <span>{selectedStalls.length}</span>
              </div>
              <div className="stall-summary__total__row">
                <span>Total Area</span>
                <span>{totalArea} sq. ft.</span>
              </div>
              <div className="stall-summary__total__row stall-summary__total__row--amount">
                <span>Total Amount</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {bookerType === 'VISITOR' ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                Visitors do not require stalls. Proceed without selecting any.
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {!hold ? (
                <button
                  id="proceed-hold-btn"
                  className="btn btn-primary stall-summary__cta"
                  onClick={handleProceed}
                  disabled={!canProceed || exceedsLimit || loading}
                >
                  {exceedsLimit ? `Max ${MAX_SELECTION_WARN} stalls` : canProceed
                    ? `Hold Selected Stalls for ₹${subtotal.toLocaleString('en-IN')} →`
                    : 'Select at least 1 stall'}
                </button>
              ) : (
                <>
                  <button
                    id="release-hold-btn"
                    className="btn btn-outline stall-summary__cta"
                    onClick={handleRelease}
                  >
                    Release &amp; Re-select
                  </button>
                  <button
                    id="continue-details-btn"
                    className="btn btn-primary stall-summary__cta"
                    onClick={handleContinueToDetails}
                    disabled={!hold}
                  >
                    Continue to Details →
                  </button>
                </>
              )}
              <button
                id="back-btn"
                className="btn btn-ghost stall-summary__cta"
                onClick={handleBack}
                onKeyDown={e => e.key === 'Enter' && handleBack()}
              >
                ← Back to Event
              </button>
            </div>

            <div style={{ marginTop: 'var(--space-md)', fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <strong>How it works:</strong> Choose your stall(s), then "Hold Selected Stalls" to reserve them for
              10 minutes while you complete your details. The total is calculated by the server from stall prices —
              never from the browser. If another user books a stall first, you'll be prompted to pick another.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
