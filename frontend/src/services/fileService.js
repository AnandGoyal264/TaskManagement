import api from './api';

export const uploadFiles = (formData) => api.post('/files/upload', formData);
export const getFilesByTask = (taskId) => api.get(`/files/task/${taskId}`);
export const getFileUrl = (id) => api.get(`/files/${id}/url`);
export const downloadFileBlob = (id) => api.get(`/files/${id}/download`, { responseType: 'blob' });
export const deleteFile = (id) => api.delete(`/files/${id}`);
