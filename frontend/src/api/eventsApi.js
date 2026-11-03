// API service — connects React frontend to Spring Boot backend

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
  try {
    data = await res.json();
  } catch (e) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Unauthorised: invalid or missing admin API key');
    }
    throw new Error(`Server returned HTTP ${res.status}`);
  }
  if (!res.ok || !data.success) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(data.message || 'Unauthorised: invalid or missing admin API key');
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
};

export const eventsApi = {
  getAll: () => safeFetch(`${BASE_URL}/events`).then(handleResponse),
  getById: (id) => safeFetch(`${BASE_URL}/events/${id}`).then(handleResponse),
  getUpcoming: () => safeFetch(`${BASE_URL}/events/upcoming`).then(handleResponse),
  getPast: () => safeFetch(`${BASE_URL}/events/past`).then(handleResponse),
  getFeatured: () => safeFetch(`${BASE_URL}/events/featured`).then(handleResponse),
  search: (keyword) => safeFetch(`${BASE_URL}/events/search?keyword=${encodeURIComponent(keyword)}`).then(handleResponse),
  getOpenForRegistration: () => safeFetch(`${BASE_URL}/events/open-for-registration`).then(handleResponse),
};

// Registrations
export const registrationsApi = {
  register: (data) => safeFetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async (res) => {
    try {
      return await res.json();
    } catch {
      return { success: false, message: `Server returned HTTP ${res.status}` };
    }
  }),

  getByCode: (code) => safeFetch(`${BASE_URL}/registrations/confirm/${code}`).then(handleResponse),
};

// Enquiries
export const enquiriesApi = {
  submit: (data) =>
    safeFetch(`${BASE_URL}/enquiries`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(async (res) => {
      let body;
      try {
        body = await res.json();
      } catch (err) {
        body = { success: false, message: `Server returned HTTP ${res.status}` };
      }
      return { ...body, status: res.status, ok: res.ok };
    }),

  getById: (id, keyOverride) => {
    const key = (keyOverride !== undefined && keyOverride !== null)
      ? keyOverride
      : (sessionStorage.getItem('admin_api_key') || '');
    const headers = { 'Content-Type': 'application/json' };
    const trimmed = typeof key === 'string' ? key.trim() : '';
    if (trimmed) headers['X-Admin-Key'] = trimmed;
    return safeFetch(`${BASE_URL}/enquiries/${id}`, { headers }).then(handleResponse);
  },

  getAll: (keyOverride) => {
    const key = (keyOverride !== undefined && keyOverride !== null)
      ? keyOverride
      : (sessionStorage.getItem('admin_api_key') || '');
    const headers = { 'Content-Type': 'application/json' };
    const trimmed = typeof key === 'string' ? key.trim() : '';
    if (trimmed) headers['X-Admin-Key'] = trimmed;
    return safeFetch(`${BASE_URL}/enquiries`, { headers }).then(handleResponse);
  },
};
