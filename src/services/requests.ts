import axios from "axios";

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
  } catch (error) {
    console.error("Login Error:", error);
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
    await axios.post(`${import.meta.env.VITE_API_URL}/admin/logout`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export { LoginAdmin, RefreshAuthToken, LogoutAdmin };
