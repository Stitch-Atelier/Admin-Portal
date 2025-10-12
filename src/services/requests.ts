import axios from "axios";
import toast from "react-hot-toast";

const LoginAdmin = async (mobile: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/login`,
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
    if (error.response) {
      console.error("Error message:", error.response.data.message);
      toast.error(error.response.data.message);
    } else {
      console.error("Something went wrong");
    }
  }
};

const RefreshAuthToken = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/refresh`,
      {},
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
      `${import.meta.env.VITE_API_URL}/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error: any) {
    if (error.response) {
      console.error("Error message:", error.response.data.message);
      toast.error(error.response.data.message);
    } else {
      console.error("Something went wrong");
    }
  }
};

export { LoginAdmin, RefreshAuthToken, LogoutAdmin };
