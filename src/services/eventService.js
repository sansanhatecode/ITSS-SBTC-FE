import api from './api';

const eventService = {
    // Get all events with pagination
    getAllEvents: async (page = 0, size = 5) => {
        try {
            const response = await api.get(`/event?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            // Nếu là lỗi CORS hoặc Network, thử trả về mock data tạm thời
            if (!error.response || error.response.status === 404) {
                return {
                    content: [
                        {
                            id: '1',
                            name: 'Event Demo 1',
                            description: 'Mô tả event demo 1',
                            startDate: '2024-03-20',
                            endDate: '2024-03-21',
                            location: 'Hà Nội',
                            image: 'https://picsum.photos/800/400',
                            status: 'UPCOMING',
                            type: 'ACADEMIC'
                        },
                        {
                            id: '2',
                            name: 'Event Demo 2',
                            description: 'Mô tả event demo 2',
                            startDate: '2024-03-22',
                            endDate: '2024-03-23',
                            location: 'Hà Nội',
                            image: 'https://picsum.photos/800/400',
                            status: 'UPCOMING',
                            type: 'ACADEMIC'
                        }
                    ],
                    totalElements: 2,
                    totalPages: 1,
                    size: 10,
                    number: 0
                };
            }
            throw error;
        }
    },

    // Get event details by ID
    getEventById: async (eventId) => {
        try {
            const response = await api.get(`/event/${eventId}`);
            return response.data;
        } catch (error) {
            // Nếu là lỗi CORS hoặc Network, thử trả về mock data tạm thời
            if (!error.response || error.response.status === 404) {
                return {
                    id: eventId,
                    name: 'Event Demo',
                    description: 'Mô tả event demo',
                    startDate: '2024-03-20',
                    endDate: '2024-03-21',
                    location: 'Hà Nội',
                    image: 'https://picsum.photos/800/400',
                    status: 'UPCOMING',
                    type: 'ACADEMIC'
                };
            }
            throw error;
        }
    },

    // Create a new event
    createEvent: async (eventData) => {
        try {
            const response = await api.post('/event', eventData);
            return response.data;
        } catch (error) {
            // Nếu là lỗi CORS hoặc Network, thử trả về mock response tạm thời
            if (!error.response || error.response.status === 404) {
                return {
                    ...eventData,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            throw error;
        }
    },

    // Register for an event
    registerEvent: async (registrationData) => {
        try {
            const response = await api.post('/event/application', registrationData);
            return response.data;
        } catch (error) {
            // Nếu là lỗi CORS hoặc Network, thử trả về mock response tạm thời
            if (!error.response || error.response.status === 404) {
                return {
                    success: true,
                    message: 'Đăng ký thành công (mock)'
                };
            }
            throw error;
        }
    }
};

export default eventService; 