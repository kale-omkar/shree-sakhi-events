/**
 * Booking API client — Jatin Patil's module.
 * Follows same fetch + handleResponse pattern as eventsApi.js and adminApi.js.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'sakhi-admin-2026';

const adminHeaders = {
  'Content-Type': 'application/json',
  'X-Admin-Key': ADMIN_KEY,
};

/** Unwraps { success, message, data } — throws on failure */
const handleResponse = async (res) => {
  let data;
  try { data = await res.json(); } catch (e) { throw new Error(`Server error: HTTP ${res.status}`); }
  if (!data.success) {
    // Collect validation field errors into one readable message
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      const msgs = Object.values(data.data).join(' • ');
      throw new Error(msgs || data.message || 'Validation failed');
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
};

/** Returns the full { success, message, data } body (for create, where we may want the message) */
const handleResponseFull = async (res) => {
  let data;
  try { data = await res.json(); } catch (e) { throw new Error(`Server error: HTTP ${res.status}`); }
  return data;
};

// ─── Public Booking APIs ──────────────────────────────────────────────────────

export const bookingApi = {

  /** POST /api/bookings — create a new booking */
  create: (data) =>
    fetch(`${BASE_URL}/bookings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(handleResponseFull),

  /** GET /api/bookings/status?ref=...&email=... — public status check */
  getStatus: (ref, email) =>
    fetch(`${BASE_URL}/bookings/status?ref=${encodeURIComponent(ref)}&email=${encodeURIComponent(email)}`)
      .then(handleResponse),

  /** POST /api/bookings/{ref}/initiate-payment — start mock/sandbox payment */
  initiatePayment: (bookingRef) =>
    fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingRef)}/initiate-payment`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),

  /** POST /api/bookings/{ref}/confirm-payment — backend verifies + marks PAID */
  confirmPayment: (bookingRef, paymentReference, signature) =>
    fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingRef)}/confirm-payment`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ paymentReference, signature }),
    }).then(handleResponse),
};

// ─── Admin Booking APIs ───────────────────────────────────────────────────────

export const adminBookingApi = {

  /** GET /api/admin/bookings?eventId=1&status=PENDING */
  getAll: (eventId, status) => {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);
    if (status && status !== 'ALL') params.append('status', status);
    return fetch(`${BASE_URL}/admin/bookings?${params}`, { headers: adminHeaders })
      .then(handleResponse);
  },

  /** PATCH /api/admin/bookings/{id} — confirm or cancel a booking */
  updateStatus: (id, data) =>
    fetch(`${BASE_URL}/admin/bookings/${id}`, {
      method:  'PATCH',
      headers: adminHeaders,
      body:    JSON.stringify(data),
    }).then(handleResponse),
};
