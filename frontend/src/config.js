// Centralized API configuration
// In production (Cloudflare Pages/Workers), VITE_API_URL can be set to your deployed backend URL.
// Defaults to http://localhost:5000 for local development.

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export { API_BASE_URL };
export default API_BASE_URL;
