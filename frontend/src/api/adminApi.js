// Protected requests include the X-Admin-Key header dynamically from session storage.

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
      const error = new Error(messages || data.message || 'Validation failed');
      error.fieldErrors = data.data;
      throw error;
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
};

export const adminEventsApi = {
  /** GET /api/admin/events — list all events (newest first). Optional keyOverride for auth check */
  getAll: (keyOverride) =>
    safeFetch(`${BASE_URL}/admin/events`, { headers: getAdminHeaders(keyOverride) })
      .then(handleResponse),

  /** GET /api/admin/events/:id */
  getById: (id) =>
    safeFetch(`${BASE_URL}/admin/events/${id}`, { headers: getAdminHeaders() })
      .then(handleResponse),

  /** POST /api/admin/events — create a new event */
  create: (eventData) =>
    safeFetch(`${BASE_URL}/admin/events`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(eventData),
    }).then(handleResponse),

  /** PUT /api/admin/events/:id — update an existing event */
  update: (id, eventData) =>
    safeFetch(`${BASE_URL}/admin/events/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(eventData),
    }).then(handleResponse),

  /** DELETE /api/admin/events/:id — delete an event */
  delete: (id) =>
    safeFetch(`${BASE_URL}/admin/events/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    }).then(handleResponse),

  /** PATCH /api/admin/events/:id/toggle-featured */
  toggleFeatured: (id) =>
    safeFetch(`${BASE_URL}/admin/events/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
    }).then(handleResponse),
};

export const adminEnquiriesApi = {
  /** GET /api/enquiries — list all enquiries (newest first). Optional keyOverride for auth check */
  getAll: (keyOverride) =>
    safeFetch(`${BASE_URL}/enquiries`, { headers: getAdminHeaders(keyOverride) })
      .then(handleResponse),

  /** GET /api/enquiries/:id — get enquiry by ID */
  getById: (id) =>
    safeFetch(`${BASE_URL}/enquiries/${id}`, { headers: getAdminHeaders() })
      .then(handleResponse),
};
