import axios from "axios";

const BASE_URL = "http://localhost:8081/api"; // ⚠️ change port if yours is different

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach correct token per route
API.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith("/admin");
  const token = isAdminRoute
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const isAdminRoute = originalRequest.url?.startsWith("/admin");
      const refreshToken = localStorage.getItem("refreshToken");
      const refreshUrl = isAdminRoute
        ? `${BASE_URL}/admin/refresh`
        : `${BASE_URL}/users/refresh`;

      try {
        const { data } = await axios.post(refreshUrl, { refreshToken });

        if (isAdminRoute) {
          localStorage.setItem("adminToken", data.accessToken);
        } else {
          localStorage.setItem("accessToken", data.accessToken);
        }

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        // Both tokens dead — clear everything and notify
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("user");

        window.dispatchEvent(new CustomEvent("session-expired", {
          detail: { isAdmin: isAdminRoute },
        }));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;