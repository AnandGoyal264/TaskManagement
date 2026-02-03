import api from './api';

export const getSummary = (params) => api.get('/analytics/summary', { params });
export const getTrends = (params) => api.get('/analytics/trends', { params });
export const exportTasksCsv = (params) => api.get('/analytics/export', { params, responseType: 'blob' });
