import { MessageForm } from '../components/MessageForm';

/**
 * HomePage — the single page of the telegram-messenger SPA.
 * Renders the card shell and delegates form logic to MessageForm.
 */
export function HomePage() {
  return (
    <main className="page" role="main">
      <div className="card">
        {/* ── Card header ─────────────────────────────────────── */}
        <header className="card__header">
          <div className="card__icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <h1 className="card__title">Telegram Messenger</h1>
            <p className="card__subtitle">
              Send a message directly to any Telegram chat.
            </p>
          </div>
        </header>

        {/* ── Form ─────────────────────────────────────────────── */}
        <MessageForm />
      </div>

      {/* ── Footer hint ─────────────────────────────────────────── */}
      <p className="page__footer">
        Powered by the{' '}
        <a
          href="https://core.telegram.org/bots/api"
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram Bot API
        </a>
      </p>
    </main>
  );
}
