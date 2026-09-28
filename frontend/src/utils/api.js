import axios from 'axios';
import IMAGE_FALLBACK from './fallback.jpg';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5003'
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('fiveStarUser');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fiveStarUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getImageUrl = (imgPath) => {
  if (!imgPath) return IMAGE_FALLBACK;
  if (imgPath.startsWith('http')) return imgPath;
  const base = (process.env.REACT_APP_API_URL || 'http://localhost:5003').replace(/\/$/, '');
  return `${base}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
};

export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = IMAGE_FALLBACK;
};

export { IMAGE_FALLBACK };
export default api;
