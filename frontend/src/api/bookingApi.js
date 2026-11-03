/**
 * Booking API client — Jatin Patil's module.
 * Follows same fetch + handleResponse pattern as eventsApi.js and adminApi.js.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const getAdminHeaders = (keyOverride) => {
  const key = (keyOverride !== undefined && keyOverride !== null)
    ? keyOverride
    : (sessionStorage.getItem('admin_api_key') || '');
  const headers = {
    'Content-Type': 'application/json',
  };
  const trimmed = typeof key === 'string' ? key.trim() : '';
  if (trimmed) {
    headers['X-Admin-Key'] = trimmed;
  }
  return headers;
};

export const adminHeaders = {
  get 'Content-Type'() { return 'application/json'; },
  get 'X-Admin-Key'() {
    const key = sessionStorage.getItem('admin_api_key') || '';
    return key.trim();
  },
};

const safeFetch = async (url, options = {}) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to backend server at ${BASE_URL}. Please ensure the Spring Boot backend is running.`);
    }
    throw err;
  }
};

/** Unwraps { success, message, data } — throws on failure */
const handleResponse = async (res) => {
  let data;
  try { data = await res.json(); } catch (e) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Unauthorised: invalid or missing admin API key');
    }
    throw new Error(`Server error: HTTP ${res.status}`);
  }
  if (!res.ok || !data.success) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(data.message || 'Unauthorised: invalid or missing admin API key');
    }
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
  try { data = await res.json(); } catch (e) {
    throw new Error(`Server error: HTTP ${res.status}`);
  }
  return data;
};

// ─── Public Booking APIs ──────────────────────────────────────────────────────

export const bookingApi = {

  /** GET /api/bookings/event/{eventId}/availability */
  getAvailability: (eventId) =>
    safeFetch(`${BASE_URL}/bookings/event/${eventId}/availability`)
      .then(handleResponse),

  /** POST /api/bookings — create a new booking */
  create: (bookingData) =>
    safeFetch(`${BASE_URL}/bookings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(bookingData),
    }).then(handleResponseFull),

  /** GET /api/bookings/my?email=user@example.com */
  getByEmail: (email) =>
    safeFetch(`${BASE_URL}/bookings/my?email=${encodeURIComponent(email)}`)
      .then(handleResponse),

  /** GET /api/bookings/{ref} */
  getByReference: (bookingRef) =>
    safeFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingRef)}`)
      .then(handleResponse),

  /** POST /api/bookings/{ref}/cancel */
  cancel: (bookingRef) =>
    safeFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingRef)}/cancel`, {
      method: 'POST',
    }).then(handleResponse),

  /** POST /api/bookings/{ref}/confirm-payment — backend verifies + marks PAID */
  confirmPayment: (bookingRef, paymentReference, signature) =>
    safeFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingRef)}/confirm-payment`, {
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
    return safeFetch(`${BASE_URL}/admin/bookings?${params}`, { headers: getAdminHeaders() })
      .then(handleResponse);
  },

  /** PATCH /api/admin/bookings/{id} — confirm or cancel a booking */
  updateStatus: (id, data) =>
    safeFetch(`${BASE_URL}/admin/bookings/${id}`, {
      method:  'PATCH',
      headers: getAdminHeaders(),
      body:    JSON.stringify(data),
    }).then(handleResponse),
};
