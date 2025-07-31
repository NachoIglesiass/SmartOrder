// src/utils/api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = {
  get: (endpoint, options = {}) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      ...options,
    }),

  post: (endpoint, body, options = {}) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options = {}) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      ...options,
    }),
};

export default api;
