import axios from "axios";
import { LogoutAdmin, RefreshAuthToken } from "./requests";
import toast from "react-hot-toast";

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
});

// Add Authorization token before request
service.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user-storage");
    const authToken = user ? JSON.parse(user)?.state?.authToken : null;

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Handle 401 responses (token expired)
service.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until token refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return service(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { response: refreshResponse } = await RefreshAuthToken();
        const newToken = refreshResponse?.authToken;

        // ✅ Update localStorage
        const user = localStorage.getItem("user-storage");
        if (user) {
          const parsedUser = JSON.parse(user);
          parsedUser.state.authToken = newToken;
          localStorage.setItem("user-storage", JSON.stringify(parsedUser));
        }

        // ✅ Update global Authorization header
        service.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return service(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);

        toast.error("Session expired. Please login again.");
        await LogoutAdmin();

        localStorage.removeItem("user-storage");
        setTimeout(() => window.location.reload(), 1500);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { service };
