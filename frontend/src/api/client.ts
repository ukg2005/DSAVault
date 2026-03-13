import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const client = axios.create({
  // In production, set VITE_API_BASE_URL to your Railway backend URL.
  baseURL: apiBaseUrl ? apiBaseUrl.replace(/\/+$/, '') : '/',
});

export default client;
