import axios from "axios";
import toast from "react-hot-toast";

const LoginAdmin = async (mobile: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/login`,
      {
        mobile,
      },
      { withCredentials: true }
    );
    return {
      response: response?.data,
      status: response?.status,
    };
  } catch (error: any) {
    if (error.status === 404) toast.error("Login Failed - No User Found.");
    if (error.status === 403) toast.error("Login Failed - Unauthorized User");
    if (error.status === 500) toast.error("Login Failed - Server Error");
    throw error;
  }
};

const RefreshAuthToken = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/refresh`,
      { withCredentials: true }
    );
    return {
      response: response?.data,
      status: response?.status,
    };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

const LogoutAdmin = async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error: any) {
    if (error.status === 404) toast.error("Logout Failed!");
    if (error.status === 500) toast.error("Logout Failed - Server Error");
    throw error;
  }
};

export { LoginAdmin, RefreshAuthToken, LogoutAdmin };
