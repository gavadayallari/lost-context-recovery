import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Ensure baseURL ends with /api to prevent 404s if the environment variable is misconfigured
if (baseURL && !baseURL.endsWith("/api")) {
  baseURL = baseURL.replace(/\/+$/, "") + "/api";
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;