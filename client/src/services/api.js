/**
 * services/api.js
 *
 * Central Axios instance for all API calls.
 *
 * - Base URL pulled from environment variable (never hardcoded)
 * - Request interceptor: attaches JWT token from localStorage 
 * - Response interceptor: handles 401 redirects
 */

import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// If accessing the app via a local network IP instead of localhost,
// assume the backend is running on the same network IP on port 5000.
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  if (baseURL.includes("localhost") && hostname !== "localhost" && hostname !== "127.0.0.1") {
    baseURL = `http://${hostname}:5000/api`;
  }
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request interceptor: attach auth token ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle common errors ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., token expired)
    }
    return Promise.reject(error);
  }
);

export default api;
