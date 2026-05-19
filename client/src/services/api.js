import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;

const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "")
  : "http://localhost:5000";

const api = axios.create({
  baseURL: normalizedApiUrl.endsWith("/api")
    ? normalizedApiUrl
    : `${normalizedApiUrl}/api`,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("dsa_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network/server unavailable
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject(error);
    }

    // Unauthorized
    if (error.response.status === 401) {
      const userType = localStorage.getItem("dsa_user_type");

      localStorage.removeItem("dsa_token");
      localStorage.removeItem("dsa_user_type");
      localStorage.removeItem("dsa_diag_completed");

      const target =
        userType === "institution"
          ? "/institution/login"
          : "/login";

      if (window.location.pathname !== target) {
        window.location.href = target;
      }
    }

    return Promise.reject(error);
  }
);

export default api;