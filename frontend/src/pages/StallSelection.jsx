import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getStalls, holdStalls, releaseHold } from '../api/stallApi';
import StepIndicator from '../components/StepIndicator';

/**
 * Stall Selection step — RedBus-style interactive floor plan.
 * Flow: select stalls on the map → hold them (server-side, TTL) → proceed to details.
 *
 * Session id is persisted in sessionStorage so holds survive refresh within the tab.
 * Stall status is polled every 15s to keep the map current.
 */
const HOLD_TTL_SECONDS = 10 * 60; // matches backend default; refreshed from hold response
const POLL_INTERVAL_MS = 15000;
const MAX_SELECTION_WARN = 5;

// Non-selectable floor-plan facilities — positions match SHREE_SAKHI_DEC_2026.pdf image
const FACILITY_BLOCKS = [
  { id: 'entry', label: 'ENTRY', top: '92%', left: '68%', w: 70, h: 28 },
  { id: 'exit', label: 'EXIT', top: '92%', left: '2%', w: 60, h: 28 },
  { id: 'stage', label: 'STAGE', top: '2%', left: '26%', w: 130, h: 26 },
  { id: 'org', label: 'ORG', top: '2%', left: '47%', w: 56, h: 26 },
  { id: 'stair', label: 'STAIR', top: '2%', left: '66%', w: 60, h: 26 },
];

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
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const eventId = flow?.eventId ? Number(flow.eventId) : (location.state?.eventId || null);
  const bookerType = flow?.bookerType || location.state?.bookerType || 'VISITOR';

  // Persist flow state whenever it changes
  useEffect(() => {
    if (flow) sessionStorage.setItem('booking_flow', JSON.stringify(flow));
  }, [flow]);

  // Initialize flow with event + booker type
  useEffect(() => {
    if (eventId && (!flow || flow.eventId !== String(eventId))) {
      setFlow({ eventId: String(eventId), bookerType, stallCodes: [], holdToken: null, sessionId });
    }
  }, [eventId, flow, bookerType]);

  // Fetch stalls
  const fetchStalls = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStalls(eventId, sessionId);
      setStalls(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load stall map. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [eventId, sessionId]);

  useEffect(() => {
    fetchStalls();

    // Poll stall status every 15s so the map stays current
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
      if (remaining <= 0) {
        handleHoldExpiry();
      }
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
    } catch { /* ignore release errors */ }
    setHold(null);
    setTimer(0);
    setSelected(new Set());
  };

  // Toggle stall selection (only when no active hold; during hold, selections are locked)
  const toggleStall = (stallCode) => {
    if (hold) return; // cannot change selection while a hold is active
    const s = stalls.find(x => x.stallCode === stallCode);
    if (!s || s.status !== 'AVAILABLE') return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(stallCode)) next.delete(stallCode);
      else next.add(stallCode);
      return next;
    });
    setError(null);
  };

  const selectedStalls = stalls.filter(s => selected.has(s.stallCode));
  const subtotal = selectedStalls.reduce((sum, s) => sum + Number(s.price || 0), 0);

  const canProceed = selectedStalls.length > 0;
  const exceedsLimit = selectedStalls.length > MAX_SELECTION_WARN;

  // Hold the selected stalls server-side
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
      // Persist hold + selection into flow
      setFlow(prev => ({ ...prev, stallCodes: Array.from(selected), holdToken: res.holdToken, sessionId }));
      setHold({
        holdToken: res.holdToken,
        expiresAt: res.expiresAt,
        total: res.total,
        heldStalls: res.heldStalls || [],
      });
      // Mark selected stalls as SELECTED on the map
      setSelected(new Set(Array.from(selected)));
    } catch (err) {
      const msg = err.message || 'Hold failed. Please try again.';
      if (msg.includes('409') || msg.includes('conflict') || msg.includes('already')) {
        setError('Stall just got booked by another user, please choose another.');
      } else {
        setError(msg);
      }
      // Refresh map to reflect current availability
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
      },
    });
  };

  const handleBack = () => {
    // Release any hold when going back
    if (hold?.holdToken) {
      releaseHold({ holdToken: hold.holdToken }).catch(() => {});
    }
    setHold(null);
    setSelected(new Set());
    navigate('/book');
  };

  const completed = new Set([1]);
  if (flow?.stallCodes && flow.stallCodes.length > 0) completed.add(2);

  const categoryColors = {
    PREMIUM: 'var(--color-primary-dark)',
    REGULAR: 'var(--color-plum)',
    CLASSIC: '#6B21A7',
    SINGLE_TABLE: 'var(--color-gold-dark)',
  };

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

  if (error && !hold && stalls.length === 0) {
    return (
      <main className="stall-page">
        <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
          <StepIndicator current={2} completed={completed} />
          <h1>Select Your Stall(s)</h1>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-error)' }}>
            {error}
            <br /><br />
            <button className="btn btn-outline" onClick={fetchStalls} onKeyDown={e => e.key === 'Enter' && fetchStalls()}>Retry</button>
            {'  '}
            <Link to="/book" className="btn btn-ghost">Back to Event</Link>
          </div>
        </div>
      </main>
    );
  }

  // Build grid positions: if all stalls have default (0,0,1x1), auto-assign sequential positions
  const allDefault = stalls.every(s => (s.posX || 0) === 0 && (s.posY || 0) === 0 && (s.width || 1) === 1 && (s.height || 1) === 1);
  const positioned = allDefault
    ? stalls.map((s, i) => ({ ...s, gridCol: (i % 8) + 1, gridRow: Math.floor(i / 8) + 1, spanCol: 1, spanRow: 1 }))
    : stalls.map(s => ({ ...s, gridCol: (s.posX || 0) + 1, gridRow: (s.posY || 0) + 1, spanCol: s.width || 1, spanRow: s.height || 1 }));

  return (
    <main className="stall-page" id="stall-selection-page">
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <StepIndicator current={2} completed={completed} />

        <header className="stall-header">
          <Link to="/book" className="stall-back" onKeyDown={e => e.key === 'Enter' && handleBack()}>&larr; Back to Event</Link>
          <div>
            <h1>Select Your Stall(s)</h1>
            <p>
              Choose your stall(s) on the floor plan. Selected stalls are held for you while you complete your details.
              {bookerType === 'VISITOR' && <span style={{ color: 'var(--color-text-muted)' }}> (Visitors do not select stalls)</span>}
            </p>
          </div>
        </header>

        {error && (
          <div className="stall-error" role="alert">⚠️ {error}</div>
        )}

        {/* ── Map ── */}
        <section className="stall-map-section">
          <div className="stall-legend">
            <div className="legend-item"><span className="legend-swatch legend-swatch--available" aria-hidden="true" />Available</div>
            <div className="legend-item"><span className="legend-swatch legend-swatch--selected" aria-hidden="true" />Selected by you</div>
            <div className="legend-item"><span className="legend-swatch legend-swatch--held" aria-hidden="true" />Held by others</div>
            <div className="legend-item"><span className="legend-swatch legend-swatch--booked" aria-hidden="true" />Booked</div>
            <div className="legend-item facility-legend">
              <span className="legend-swatch legend-swatch--facility" aria-hidden="true" />Facility (non-bookable)
            </div>
          </div>

          <div className="stall-map" role="grid" aria-label="Event floor plan">
            {/* Facility blocks (non-selectable) */}
            {FACILITY_BLOCKS.map(block => (
              <div
                key={block.id}
                className="map-block"
                style={{
                  top: block.top, left: block.left, right: block.right,
                  width: block.w, height: block.h,
                  position: 'absolute',
                }}
                title={block.label}
                aria-label={`${block.label} area — not bookable`}
              >
                {block.label}
              </div>
            ))}
            {/* Stalls */}
            {positioned.map((stall) => {
              const isSelected = selected.has(stall.stallCode);
              const isHeldByUs = hold && hold.heldStalls.some(h => h.stallCode === stall.stallCode);
              let stateClass = 'stall-cell--available';
              let isInteractive = true;
              if (stall.status === 'BOOKED') { stateClass = 'stall-cell--booked'; isInteractive = false; }
              else if (stall.status === 'HELD' && !isHeldByUs) { stateClass = 'stall-cell--held'; isInteractive = false; }
              else if (isSelected || isHeldByUs) { stateClass = 'stall-cell--selected'; }

              const category = (stall.stallType || 'REGULAR').toUpperCase();
              const priceText = stall.price != null ? `₹${Number(stall.price).toLocaleString('en-IN')}` : '—';

              return (
                <div
                  key={stall.stallCode}
                  className={`stall-cell ${stateClass} stall-cell--${category.toLowerCase().replace('_', '-')}`}
                  style={{
                    gridColumn: `${stall.gridCol} / span ${stall.spanCol}`,
                    gridRow: `${stall.gridRow} / span ${stall.spanRow}`,
                  }}
                  role="gridcell"
                  aria-label={`Stall ${stall.stallCode}, ${stall.sizeLabel || 'size pending'}, ${category}, ${priceText}, ${stall.status}`}
                  aria-pressed={isSelected}
                  tabIndex={isInteractive ? 0 : -1}
                  onClick={() => isInteractive && toggleStall(stall.stallCode)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isInteractive) toggleStall(stall.stallCode);
                    }
                  }}
                  title={`Stall ${stall.stallCode} — ${stall.sizeLabel || 'size pending'} — ${category} — ${priceText} — ${stall.status}`}
                >
                  <span className="stall-cell__badge">{stall.stallCode}</span>
                  <span className="stall-cell__price">{priceText}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Sticky Summary ── */}
        <aside className="stall-summary">
          <div className="stall-summary__title">
            {hold ? 'Hold Active' : 'Selected Stalls'}
          </div>

          {hold ? (
            <div className="stall-summary__timer">
              Hold expires in {Math.floor(timer / 60)}m {timer % 60}s
              {timer <= 0 && <span> — releasing…</span>}
            </div>
          ) : null}

          {selectedStalls.length > 0 ? (
            <div className="stall-summary__list">
              {selectedStalls.map(s => (
                <div key={s.stallCode} className="stall-summary__item">
                  <span>
                    Stall {s.stallCode} ({s.sizeLabel || 'size pending'}) — {(s.stallType || 'Regular')}
                  </span>
                  <span>₹{Number(s.price || 0).toLocaleString('en-IN')}</span>
                  {!hold && (
                    <button
                      className="stall-summary__item__remove"
                      onClick={() => toggleStall(s.stallCode)}
                      onKeyDown={e => e.key === 'Enter' && toggleStall(s.stallCode)}
                      title={`Remove stall ${s.stallCode}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="stall-summary__empty">No stalls selected</div>
          )}

          <div className="stall-summary__divider" />
          <div className="stall-summary__total">
            <span>Grand Total</span>
            <span>₹{hold ? Number(hold.total || subtotal).toLocaleString('en-IN') : subtotal.toLocaleString('en-IN')}</span>
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
                {exceedsLimit ? `Max ${MAX_SELECTION_WARN} stalls` : canProceed ? 'Hold Selected Stalls →' : 'Select at least 1 stall'}
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
    </main>
  );
}
