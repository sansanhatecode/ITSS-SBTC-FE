import api from './api';

const eventService = {
    // Get all events with pagination
    getAllEvents: async (mssvId, page = 0, size = 5) => {
        try {
            const response = await api.get(`/event?mssvId=${mssvId}&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get event details by ID
    getEventById: async (eventId, mssvId) => {
        try {
            console.log(`----------------------/event/${eventId}?mssvId=${mssvId}`)
            const response = await api.get(`/event/${eventId}?mssvId=${mssvId}`);
            // console.log("-------------------------response", response);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Create a new event
    createEvent: async (eventData) => {
        try {
            const response = await api.post('/event', eventData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Register for an event
    registerEvent: async (mssvId, eventId) => {
        try {
            const response = await api.post('/event/application', {
                mssvId,
                eventId
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default eventService; 