import { useNavigate } from 'react-router-dom';

/**
 * Booking step indicator — 1 Event → 2 Stalls → 3 Details → 4 Payment → 5 Confirmation.
 * current: 1-based index of the active step.
 * completed: set of step numbers already completed.
 */
const STEPS = [
  { num: 1, label: 'Event', desc: 'Choose your event' },
  { num: 2, label: 'Stalls', desc: 'Pick your stall(s)' },
  { num: 3, label: 'Details', desc: 'Enter your details' },
  { num: 4, label: 'Payment', desc: 'Complete payment' },
  { num: 5, label: 'Confirmation', desc: 'Booking confirmed' },
];

export default function StepIndicator({ current, completed = new Set(), className = '' }) {
  const navigate = useNavigate();

  const stepRoutes = { 1: '/book', 2: '/book/stalls', 3: '/book/details', 4: '/book/pay', 5: '/book/confirm' };

  return (
    <div
      className={`step-indicator ${className}`}
      aria-label="Booking process steps"
      role="navigation"
      aria-current={`Step ${current} of ${STEPS.length}`}
    >
      {STEPS.map((step, i) => {
        const isDone = completed.has(step.num);
        const isActive = step.num === current;
        const isClickable = isDone || isActive;
        return (
          <div key={step.num} className="step-indicator__group">
            <button
              type="button"
              className={`step-indicator__step ${
                isDone ? 'done' : ''
              } ${isActive ? 'active' : ''} ${!isClickable ? 'disabled' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${step.num}: ${step.label} ${isActive ? '(current)' : ''}`}
              disabled={!isClickable}
              onClick={() => isClickable && navigate(stepRoutes[step.num])}
            >
              <span className="step-indicator__num">{step.num}</span>
              <span className="step-indicator__label">{step.label}</span>
            </button>
            <span className="step-indicator__desc">{step.desc}</span>
            {i < STEPS.length - 1 && (
              <div className={`step-indicator__line ${isDone ? 'done' : ''}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
