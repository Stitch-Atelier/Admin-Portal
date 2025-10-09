// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/dashboard/Home";
import RouteGuard from "./components/RouteGaurd";
import Layout from "./components/dashboard/Layout";
const router = createBrowserRouter([
  {
    path: "/",
    element: <RouteGuard element={<Login />} requiresAuth={false} />,
  },
  {
    path: "/dashboard",
    element: <RouteGuard element={<Layout />} requiresAuth={true} />,
    children: [
      {
        index: true,
        element: <RouteGuard element={<Home />} requiresAuth={true} />,
      },
    ],
  },
]);

export default router;
