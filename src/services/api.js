import axios from 'axios';

// Vite uses import.meta.env for frontend variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to headers for protected routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// EXPLICIT EXPORTS - This fixes the SearchBar error
// Current line in your api.jsx
export const searchSongs = (query, isAi) => api.get(`/music/search?q=${query}${isAi ? '&ai=true' : ''}`);

export const createRoom = () => api.post('/rooms/create');

export const joinRoom = (roomCode) => api.get(`/rooms/${roomCode}`);

export default api;