import axios from 'axios';

const api = axios.create({
    baseURL: 'https://itss2-hustevent.onrender.com/api/v1', // Updated to match the backend URL
    // baseURL: 'http://localhost:8080/api/v1', // Updated to match the backend URL
    // baseURL: 'https://83db-2402-800-61c5-a067-3138-ba63-aec0-2168.ngrok-free.app/api/v1', // Updated to match the backend URL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // withCredentials: true // Enable credentials since backend supports it
});

// Add a request interceptor
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        // Return the data property from the ApiResponse structure
        return response.data;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.request);
            return Promise.reject({
                message: 'Unable to connect to server. Please try again later.'
            });
        } else {
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
                    name: 'Demo Event 1',
                    description: 'Description for demo event 1',
                    startDate: '2024-03-20',
                    endDate: '2024-03-21',
                    location: 'Hanoi',
                    image: 'https://picsum.photos/800/400',
                    status: 'UPCOMING',
                    type: 'ACADEMIC'
                },
                {
                    id: 'mock2',
                    name: 'Demo Event 2',
                    description: 'Description for demo event 2',
                    startDate: '2024-03-22',
                    endDate: '2024-03-23',
                    location: 'Hanoi',
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