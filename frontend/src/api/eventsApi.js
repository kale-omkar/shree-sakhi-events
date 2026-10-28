// API service — connects React frontend to Spring Boot backend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Something went wrong');
  return data.data;
};

// Events
export const eventsApi = {
  getAll:      () => fetch(`${BASE_URL}/events`).then(handleResponse),
  getById:     (id) => fetch(`${BASE_URL}/events/${id}`).then(handleResponse),
  getUpcoming: () => fetch(`${BASE_URL}/events/upcoming`).then(handleResponse),
  getPast:     () => fetch(`${BASE_URL}/events/past`).then(handleResponse),
  getFeatured: () => fetch(`${BASE_URL}/events/featured`).then(handleResponse),
  search:      (keyword) => fetch(`${BASE_URL}/events/search?keyword=${encodeURIComponent(keyword)}`).then(handleResponse),
};

// Registrations
export const registrationsApi = {
  register: (data) => fetch(`${BASE_URL}/registrations`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  }).then(async (res) => {
    const body = await res.json();
    return body; // return full body so we can inspect success/message
  }),

  getByCode: (code) => fetch(`${BASE_URL}/registrations/confirm/${code}`).then(handleResponse),
};

// Enquiries
export const enquiriesApi = {
  submit: (data) =>
    fetch(`${BASE_URL}/enquiries`, {
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

  getById: (id) => fetch(`${BASE_URL}/enquiries/${id}`).then(handleResponse),
  getAll:  () => fetch(`${BASE_URL}/enquiries`).then(handleResponse),
};

