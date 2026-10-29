// Protected requests include the X-Admin-Key header dynamically from session storage or environment.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const getAdminHeaders = (keyOverride) => {
  const key = keyOverride || sessionStorage.getItem('admin_api_key') || import.meta.env.VITE_ADMIN_KEY || '';
  const headers = {
    'Content-Type': 'application/json',
  };
  if (key) {
    headers['X-Admin-Key'] = key;
  }
  return headers;
};

export const adminHeaders = {
  get 'Content-Type'() { return 'application/json'; },
  get 'X-Admin-Key'() {
    return sessionStorage.getItem('admin_api_key') || import.meta.env.VITE_ADMIN_KEY || '';
  },
};

const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (err) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Unauthorised: invalid or missing admin API key');
    }
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  if (!res.ok || !data.success) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(data.message || 'Unauthorised: invalid or missing admin API key');
    }
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
  /** GET /api/admin/events — list all events (newest first). Optional keyOverride for auth check */
  getAll: (keyOverride) =>
    fetch(`${BASE_URL}/admin/events`, { headers: getAdminHeaders(keyOverride) })
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

export const adminEnquiriesApi = {
  /** GET /api/enquiries — list all enquiries (newest first). Optional keyOverride for auth check */
  getAll: (keyOverride) =>
    fetch(`${BASE_URL}/enquiries`, { headers: getAdminHeaders(keyOverride) })
      .then(handleResponse),

  /** GET /api/enquiries/:id — get enquiry by ID */
  getById: (id) =>
    fetch(`${BASE_URL}/enquiries/${id}`, { headers: adminHeaders })
      .then(handleResponse),
};
