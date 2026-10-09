// Centralized API configuration
// In production (Cloudflare Pages/Workers), VITE_API_URL can be set to your deployed backend URL.
// Defaults to http://localhost:5000 for local development.

let rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();

// When Render's fromService: { property: host } is used, it provides 'subdomain.onrender.com' without protocol
if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}

const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export { API_BASE_URL };
export default API_BASE_URL;
