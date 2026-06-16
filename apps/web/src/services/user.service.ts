import { api } from './api';

export const userService = {
  // ─── Reminders ───
  getReminders: async () => {
    const res = await api.get('/reminders');
    return res.data.data;
  },
  createReminder: async (data: any) => {
    const res = await api.post('/reminders', data);
    return res.data.data;
  },
  updateReminder: async (id: string, data: any) => {
    const res = await api.patch(`/reminders/${id}`, data);
    return res.data.data;
  },
  deleteReminder: async (id: string) => {
    const res = await api.delete(`/reminders/${id}`);
    return res.data.data;
  },
  completeReminder: async (id: string) => {
    const res = await api.post(`/reminders/${id}/complete`);
    return res.data.data;
  },
  dismissReminder: async (id: string) => {
    const res = await api.post(`/reminders/${id}/dismiss`);
    return res.data.data;
  },
  
  // ─── Support ───
  getSupportTickets: async () => {
    const res = await api.get('/support/tickets');
    return res.data.data;
  },
  getSupportTicketById: async (id: string) => {
    const res = await api.get(`/support/tickets/${id}`);
    return res.data.data;
  },
  createSupportTicket: async (data: { subject: string, message: string }) => {
    const res = await api.post('/support/tickets', {
      subject: data.subject,
      content: data.message,
      category: 'general'
    });
    return res.data.data;
  },
  replyToSupportTicket: async (id: string, content: string) => {
    const res = await api.post(`/support/tickets/${id}/messages`, { content });
    return res.data.data;
  }
};
