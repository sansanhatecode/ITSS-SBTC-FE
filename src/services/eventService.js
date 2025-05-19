import api from './api';

const eventService = {
  getAllEvents: async (mssvId, page = 0, size = 5) => {
    const response = await api.get(`/event?mssvId=${mssvId}&page=${page}&size=${size}`);
    return response.data;
  },

  getEventById: async (eventId, mssvId) => {
    const response = await api.get(`/event/${eventId}?mssvId=${mssvId}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/event', eventData);
    return response.data;
  },

  registerEvent: async (mssvId, eventId) => {
    const response = await api.post('/event/application', {
      mssvId,
      eventId
    });
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default eventService;