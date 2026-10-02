import { useState } from 'react';
import { sendMessage as apiSendMessage } from '../services/api';
import { StatusBanner } from './StatusBanner';

/**
 * MessageForm — the primary UI component.
 *
 * Fields:
 *   chatId  — numeric Telegram chat ID
 *   message — text content (1-4096 chars)
 *
 * States:
 *   idle     → user is filling the form
 *   loading  → request in flight
 *   success  → message sent
 *   error    → validation or network/API error
 */

const INITIAL_FORM = { chatId: '', message: '' };
const MAX_MESSAGE_LENGTH = 4096;

/** Client-side field validation — mirrors backend rules exactly */
function validate(fields) {
  const errs = {};

  if (!fields.chatId.trim()) {
    errs.chatId = 'Chat ID is required.';
  } else if (!/^-?\d+$/.test(fields.chatId.trim())) {
    errs.chatId = 'Chat ID must be a numeric value (e.g. 123456789).';
  }

  if (!fields.message.trim()) {
    errs.message = 'Message is required.';
  } else if (fields.message.trim().length > MAX_MESSAGE_LENGTH) {
    errs.message = `Message must not exceed ${MAX_MESSAGE_LENGTH} characters.`;
  }

  return errs;
}

export function MessageForm() {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState(null);    // null | 'success' | 'error'
  const [banner, setBanner]   = useState('');
  const [loading, setLoading] = useState(false);

  const charCount = form.message.length;
  const charOver  = charCount > MAX_MESSAGE_LENGTH;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear banner on any change
    if (status) {
      setStatus(null);
      setBanner('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Client-side validation first
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setStatus(null);
    setBanner('');

    try {
      const result = await apiSendMessage({
        chatId: form.chatId.trim(),
        message: form.message.trim(),
      });

      if (result.success) {
        setStatus('success');
        setBanner(`Message sent! (ID: ${result.messageId})`);
        setForm(INITIAL_FORM); // Reset form on success
        setErrors({});
      } else {
        setStatus('error');
        setBanner(result.error || 'Failed to send message. Please try again.');
      }
    } catch (_err) {
      setStatus('error');
      setBanner('Network error. Make sure the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Send Telegram message"
    >
      {/* ── Status Banner ─────────────────────────────────────── */}
      <StatusBanner status={status} message={banner} />

      {/* ── Chat ID field ──────────────────────────────────────── */}
      <div className="field">
        <label className="field__label" htmlFor="chatId">
          Chat ID <span aria-hidden="true">*</span>
        </label>
        <input
          id="chatId"
          name="chatId"
          type="text"
          className={`field__input${errors.chatId ? ' field__input--error' : ''}`}
          value={form.chatId}
          onChange={handleChange}
          placeholder="e.g. 123456789"
          autoComplete="off"
          inputMode="numeric"
          aria-required="true"
          aria-describedby={errors.chatId ? 'chatId-error' : 'chatId-hint'}
          disabled={loading}
        />
        {errors.chatId ? (
          <span id="chatId-error" className="field__error" role="alert">
            <span aria-hidden="true">⚠</span> {errors.chatId}
          </span>
        ) : (
          <span id="chatId-hint" className="field__hint">
            Find your ID by messaging{' '}
            <a
              href="https://t.me/userinfobot"
              target="_blank"
              rel="noopener noreferrer"
            >
              @userinfobot
            </a>{' '}
            on Telegram.
          </span>
        )}
      </div>

      {/* ── Message field ──────────────────────────────────────── */}
      <div className="field">
        <label className="field__label" htmlFor="message">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={`field__textarea${errors.message || charOver ? ' field__textarea--error' : ''}`}
          value={form.message}
          onChange={handleChange}
          placeholder="Type your message here…"
          aria-required="true"
          aria-describedby={errors.message ? 'message-error' : 'message-counter'}
          disabled={loading}
          maxLength={MAX_MESSAGE_LENGTH + 1} // allow typing over to show error
        />
        {errors.message ? (
          <span id="message-error" className="field__error" role="alert">
            <span aria-hidden="true">⚠</span> {errors.message}
          </span>
        ) : (
          <span
            id="message-counter"
            className="field__hint"
            style={{ color: charOver ? 'var(--color-error-text)' : undefined }}
            aria-live="polite"
          >
            {charCount} / {MAX_MESSAGE_LENGTH}
          </span>
        )}
      </div>

      {/* ── Submit button ──────────────────────────────────────── */}
      <button
        type="submit"
        className="btn btn--primary"
        disabled={loading || charOver}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="spinner" role="progressbar" aria-label="Sending…" />
            Sending…
          </>
        ) : (
          <>
            <span aria-hidden="true">✈</span>
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
