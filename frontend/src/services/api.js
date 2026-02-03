import axios from 'axios';

const api = axios.create({
  // Vite exposes env through import.meta.env in the browser. `process` is not defined in the browser runtime.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handler: on 401, clear token and redirect to login for a smoother UX
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // remove token and inform the user
      localStorage.removeItem('token');
      try {
        // show a friendly message
        alert('Session expired or not authenticated. You will be redirected to login.');
      } catch (e) {
        // ignore alert errors
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
