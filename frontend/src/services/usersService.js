import api from './api';

export const listUsers = (params) => api.get('/users', { params });
export const getAllUsers = () => api.get('/users', { params: { limit: 1000 } });
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
