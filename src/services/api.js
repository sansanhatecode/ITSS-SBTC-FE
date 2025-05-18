import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Adjust this to match your backend URL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false // Disable credentials for now since backend might not support it yet
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        // Return the actual data from the response
        return response.data;
    },
    (error) => {
        // Handle errors here
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
            const mockData = getMockData(error.config.url);
            return Promise.resolve(mockData);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
            return Promise.reject({ message: error.message });
        }
    }
);

// Helper function to return mock data based on the endpoint
const getMockData = (url) => {
    if (url.includes('/event')) {
        return {
            content: [
                {
                    id: 'mock1',
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
                    id: 'mock2',
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
    return null;
};

export default api; 