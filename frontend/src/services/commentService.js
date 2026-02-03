import api from './api';

export const addComment = (payload) => api.post('/comments', payload);
export const getCommentsByTask = (taskId) => api.get(`/comments/task/${taskId}`);
export const updateComment = (id, payload) => api.put(`/comments/${id}`, payload);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
