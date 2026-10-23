// Admin API service — connects React admin panel to Spring Boot admin endpoints
// All requests include the X-Admin-Key header for basic access control.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'sakhi-admin-2026';

const adminHeaders = {
  'Content-Type': 'application/json',
  'X-Admin-Key': ADMIN_KEY,
};

const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  if (!res.ok || !data.success) {
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      const messages = Object.entries(data.data)
        .map(([field, msg]) => `${msg}`)
        .join(', ');
      throw new Error(messages || data.message || 'Validation failed');
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
};

export const adminEventsApi = {
  /** GET /api/admin/events — list all events (newest first) */
  getAll: () =>
    fetch(`${BASE_URL}/admin/events`, { headers: adminHeaders })
      .then(handleResponse),

  /** GET /api/admin/events/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/admin/events/${id}`, { headers: adminHeaders })
      .then(handleResponse),

  /** POST /api/admin/events — create a new event */
  create: (eventData) =>
    fetch(`${BASE_URL}/admin/events`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(eventData),
    }).then(handleResponse),

  /** PUT /api/admin/events/:id — update an existing event */
  update: (id, eventData) =>
    fetch(`${BASE_URL}/admin/events/${id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify(eventData),
    }).then(handleResponse),

  /** DELETE /api/admin/events/:id — delete an event */
  delete: (id) =>
    fetch(`${BASE_URL}/admin/events/${id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then(handleResponse),

  /** PATCH /api/admin/events/:id/toggle-featured */
  toggleFeatured: (id) =>
    fetch(`${BASE_URL}/admin/events/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: adminHeaders,
    }).then(handleResponse),
};
