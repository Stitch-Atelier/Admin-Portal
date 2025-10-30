import axios from "axios";
import toast from "react-hot-toast";
import { service } from "./service";

const LoginAdmin: any = async (mobile: string) => {
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

const FetchAddress: any = async (userId: string) => {
  try {
    const response = await service.post(
      `${import.meta.env.VITE_API_URL}/users/address`,
      {
        userId,
      },
      { withCredentials: true }
    );
    return {
      response: response?.data, // It returns array of addresses
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
const FetchAllDresses: any = async () => {
  try {
    const response = await service.get(
      `${import.meta.env.VITE_API_URL}/users/dress`,
      { withCredentials: true }
    );
    return {
      response: response?.data, // It returns array of addresses
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

const CreateOrderWithImages = async (orderData: any, images: File[]) => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();

    // Add order data as JSON string
    formData.append("orderData", JSON.stringify(orderData));

    // Add all dress images
    images.forEach((image) => {
      formData.append("dressImages", image);
    });

    // Make the request
    const response = await service.post("/users/order", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      response: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      response: error.response?.data || { message: "Failed to create order" },
      status: error.response?.status || 500,
    };
  }
};

const FetchPendingOrders = async () => {
  try {
    const response = await service.get(
      `${import.meta.env.VITE_API_URL}/users/order`, // ✅ corrected endpoint
      { withCredentials: true }
    );

    return {
      status: response.status,
      response: response.data.data, // ✅ only the array of orders
    };
  } catch (error: any) {
    if (error.response) {
      toast.error(
        error.response.data.message || "Failed to fetch pending orders"
      );
      console.error("Error:", error.response.data.message);
      return { status: error.response.status, response: [] };
    } else {
      console.error("Network or unknown error:", error);
      toast.error("Network error occurred");
      return { status: 500, response: [] };
    }
  }
};

export {
  LoginAdmin,
  RefreshAuthToken,
  LogoutAdmin,
  FetchAddress,
  CreateOrderWithImages,
  FetchAllDresses,
  FetchPendingOrders,
};
