/**
 * Stall API client — Shree Sakhi Events stall selection module.
 * Follows the same fetch + handleResponse pattern as bookingApi.js / eventsApi.js.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

const handleResponse = async (res) => {
  let data;
  try { data = await res.json(); } catch (e) {
    throw new Error(`Server error: HTTP ${res.status}`);
  }
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
};

/**
 * GET /api/events/{eventId}/stalls?sessionId=...
 * All stalls for an event with live status (AVAILABLE / HELD / BOOKED).
 */
export const getStalls = (eventId, sessionId) => {
  const url = new URL(`${BASE_URL}/events/${eventId}/stalls`);
  if (sessionId) url.searchParams.append('sessionId', sessionId);
  return safeFetch(url.toString()).then(handleResponse);
};

/**
 * POST /api/stalls/hold
 * Body: { eventId, stallCodes[], sessionId }
 */
export const holdStalls = (payload) =>
  safeFetch(`${BASE_URL}/stalls/hold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

/**
 * POST /api/stalls/release
 * Body: { holdToken } or { sessionId }
 */
export const releaseHold = (payload) =>
  safeFetch(`${BASE_URL}/stalls/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);
