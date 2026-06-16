import { api } from './api';
import type { CreateJourneyEventInput, UpdateJourneyEventInput, AdvanceStageInput } from '@nextx/shared';

export const journeyService = {
  getTimeline: async (childId: string) => {
    const res = await api.get(`/journey/children/${childId}/timeline`);
    return res.data.data;
  },
  getNextSteps: async (childId: string) => {
    const res = await api.get(`/journey/children/${childId}/next-steps`);
    return res.data.data;
  },
  getActions: async (childId: string) => {
    const res = await api.get(`/journey/children/${childId}/actions`);
    return res.data.data;
  },
  createEvent: async (childId: string, data: CreateJourneyEventInput) => {
    const res = await api.post(`/journey/children/${childId}/events`, data);
    return res.data.data;
  },
  updateEvent: async (id: string, data: UpdateJourneyEventInput) => {
    const res = await api.patch(`/journey/events/${id}`, data);
    return res.data.data;
  },
  deleteEvent: async (id: string) => {
    await api.delete(`/journey/events/${id}`);
  },
  completeAction: async (id: string) => {
    const res = await api.post(`/journey/events/${id}/complete`);
    return res.data.data;
  },
  advanceStage: async (childId: string, data: AdvanceStageInput) => {
    const res = await api.post(`/journey/children/${childId}/advance-stage`, data);
    return res.data.data;
  },
};
