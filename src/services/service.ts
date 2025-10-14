import axios from "axios";
import { LogoutAdmin, RefreshAuthToken } from "./requests";
import toast from "react-hot-toast";

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000, // e.g. 10 seconds
});

service.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user-storage");

    const authToken = user ? JSON.parse(user)?.state?.authToken : null;

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
      try {
        const { response } = await RefreshAuthToken(); // call refresh endpoint
        // Update token in local storage
        const user = localStorage.getItem("user-storage");
        if (user) {
          const parsedUser = JSON.parse(user);
          parsedUser.authToken = response?.authToken; // update token
          localStorage.setItem("user-storage", JSON.stringify(parsedUser));
        }

        // Retry original request with new token
        error.config.headers["Authorization"] = `Bearer ${response?.authToken}`;
      } catch (error: any) {
        if (error.response) {
          console.error("Error message:", error.response.data.message);
          toast.error(error.response.data.message);
          await LogoutAdmin();
          setTimeout(() => {
            window.localStorage.removeItem("user-storage");
            window.location.reload();
          }, 1500);
        } else {
          console.error("Something went wrong");
        }
      }

      return axios(error.config);
    }
    return Promise.reject(error);
  }
);

export { service };
