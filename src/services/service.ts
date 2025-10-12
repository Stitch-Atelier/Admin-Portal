import axios from "axios";
import { RefreshAuthToken } from "./requests";

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000, // e.g. 10 seconds
});

service.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user-storage");
    const authToken = user ? JSON.parse(user).authToken : null;

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      const newToken = await RefreshAuthToken(); // call refresh endpoint
      console.log("This is newToken from response interceptor ", newToken);

      // Update token in local storage
      const user = localStorage.getItem("user-storage");
      if (user) {
        const parsedUser = JSON.parse(user);
        parsedUser.authToken = newToken; // update token
        localStorage.setItem("user-storage", JSON.stringify(parsedUser));
      }

      // Retry original request with new token
      error.config.headers["Authorization"] = `Bearer ${newToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);

export { service };
