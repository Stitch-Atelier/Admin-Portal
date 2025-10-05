import axios from "axios";

// ✅ Create Axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. "https://api.hello.com"
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000, // e.g. 10 seconds
});

// ✅ Request Interceptor
service.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("user-storage");
    if (authToken) {
      // Attach token in Authorization header
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    // Request error handling
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor
// service.interceptors.response.use();

export default service;
