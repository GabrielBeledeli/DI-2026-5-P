import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // ESSENCIAL: Envia e recebe cookies em todas as chamadas
});

export default api;
