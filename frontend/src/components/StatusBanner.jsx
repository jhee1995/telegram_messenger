/**
 * StatusBanner — displays a success or error message after form submission.
 *
 * Props:
 *   status  : 'success' | 'error'
 *   message : string
 */
export function StatusBanner({ status, message }) {
  if (!message) return null;

  const isSuccess = status === 'success';

  return (
    <div
      className={`status-banner status-banner--${status}`}
      role="alert"
      aria-live="polite"
    >
      <span className="status-banner__icon" aria-hidden="true">
        {isSuccess ? '✓' : '✕'}
      </span>
      <span>{message}</span>
    </div>
  );
}
