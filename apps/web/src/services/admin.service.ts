import { api } from './api';

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const adminService = {
  // Stats
  getStatsOverview: () => api.get('/admin/stats/overview').then((r) => r.data.data),
  getStatsSignups: (days = 30) => api.get('/admin/stats/signups', { params: { days } }).then((r) => r.data.data),
  getStatsChatVolume: () => api.get('/admin/stats/chat-volume').then((r) => r.data.data),
  getStatsSubscriptions: () => api.get('/admin/stats/subscriptions').then((r) => r.data.data),

  // Users
  getUsers: (page = 1, limit = 50) => api.get('/admin/users', { params: { page, limit } }).then((r) => r.data.data),
  getUserById: (id: string) => api.get(`/admin/users/${id}`).then((r) => r.data.data),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data).then((r) => r.data.data),

  // Subscriptions
  overrideSubscription: (userId: string, data: any) => api.post(`/admin/subscriptions/${userId}/override`, data).then((r) => r.data.data),
  removeSubscriptionOverride: (userId: string) => api.delete(`/admin/subscriptions/${userId}/override`).then((r) => r.data.data),

  // Documents
  getDocuments: (page = 1, limit = 50) => api.get('/admin/documents', { params: { page, limit } }).then((r) => r.data.data),
  downloadDocument: (id: string) => api.get(`/admin/documents/${id}/download`).then((r) => r.data.data),

  // Support
  getSupportTickets: (page = 1, limit = 50, status?: string) => api.get('/admin/support/tickets', { params: { page, limit, status } }).then((r) => r.data.data),
  getSupportTicketById: (id: string) => api.get(`/admin/support/tickets/${id}`).then((r) => r.data.data),
  replyToSupportTicket: (id: string, content: string) => api.post(`/admin/support/tickets/${id}/reply`, { content }).then((r) => r.data.data),
  updateSupportTicket: (id: string, data: any) => api.patch(`/admin/support/tickets/${id}`, data).then((r) => r.data.data),

  // Knowledge
  getKnowledgeArticles: () => api.get('/admin/knowledge').then((r) => r.data.data),
  createKnowledgeArticle: (data: any) => api.post('/admin/knowledge', data).then((r) => r.data.data),
  updateKnowledgeArticle: (id: string, data: any) => api.patch(`/admin/knowledge/${id}`, data).then((r) => r.data.data),
  deleteKnowledgeArticle: (id: string) => api.delete(`/admin/knowledge/${id}`).then((r) => r.data.data),

  // Alerts
  getStalledAlerts: () => api.get('/admin/alerts/stalled').then((r) => r.data.data),
  acknowledgeAlert: (id: string) => api.post(`/admin/alerts/${id}/acknowledge`).then((r) => r.data.data),

  // Audit
  getAuditLogs: (page = 1, limit = 50) => api.get('/admin/audit-logs', { params: { page, limit } }).then((r) => r.data.data),
};
