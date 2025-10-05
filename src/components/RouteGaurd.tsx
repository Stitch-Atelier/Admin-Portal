// src/components/RouteGuard.jsx
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/user";
import { useEffect, type JSX } from "react";

const RouteGuard = ({
  element,
  requiresAuth,
}: {
  element: JSX.Element;
  requiresAuth: boolean;
}) => {
  const navigate = useNavigate();
  const token = useUserStore((state) => state?.authToken);

  useEffect(() => {
    if (requiresAuth && !token) {
      // Protected route without token -> go to login
      navigate("/");
    } else if (!requiresAuth && token) {
      // Public route with token -> go to dashboard
      navigate("/dashboard");
    }
  }, [token, navigate, requiresAuth]);

  return element;
};

export default RouteGuard;
