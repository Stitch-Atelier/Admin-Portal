// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/dashboard/Home";
import RouteGuard from "./components/RouteGaurd";
import Layout from "./components/dashboard/Layout";
import UserLay from "./components/dashboard/user/UserLay";
import OrderLay from "./components/dashboard/order/OrderLay";
import CreateUser from "./components/dashboard/user/CreateUser";
import CreateOrder from "./components/dashboard/order/CreateOrder";

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
      {
        path: "customer",
        element: <RouteGuard requiresAuth={true} element={<UserLay />} />,
        children: [
          {
            path: "create",
            element: (
              <RouteGuard requiresAuth={true} element={<CreateUser />} />
            ),
          },
        ],
      },
      {
        path: "order",
        element: <RouteGuard requiresAuth={true} element={<OrderLay />} />,
        children: [
          {
            path: "create",
            element: (
              <RouteGuard requiresAuth={true} element={<CreateOrder />} />
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
