// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Asegurate de tener esta variable en tu .env
  withCredentials: true,
});

export default api;
