import axios from 'axios';

const baseURL = 'http://localhost:8080';

if (!baseURL) {
  console.warn('⚠️ Warning: VITE_API_BASE_URL is undefined. Check your .env file setup.');
}
console.log(baseURL, 'base URL');

const api = axios.create({
  baseURL: baseURL, // Hardcoded fallback port for development safety
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
