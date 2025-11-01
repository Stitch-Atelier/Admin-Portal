// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/dashboard/Home";
import RouteGuard from "./components/RouteGaurd";
import Layout from "./components/dashboard/Layout";
import UserLay from "./components/dashboard/user/UserLay";
import CreateUser from "./components/dashboard/user/CreateUser";
import CreateOrder from "./components/dashboard/order/CreateOrder";
import OrderLay from "./components/dashboard/order/OrderLay";
import UpdateOrder from "./components/dashboard/order/UpdateOrder";
import OrderInDetail from "./components/dashboard/order/OrderInDetail";

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
          {
            path: "update",
            element: (
              <RouteGuard requiresAuth={true} element={<UpdateOrder />} />
            ),
          },
          {
            path: ":orderId",
            element: (
              <RouteGuard requiresAuth={true} element={<OrderInDetail />} />
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
