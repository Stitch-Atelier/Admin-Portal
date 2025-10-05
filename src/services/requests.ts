import axios from "axios";

const LoginAdmin = async (mobile: string) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
      mobile,
    });
    return {
      response: response?.data,
      status: response?.status,
    };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};
export { LoginAdmin };
