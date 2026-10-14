import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentCustomer } from "../services/api";

// Wraps any route that should only be reachable while logged in.
// It re-checks with the backend (GET /customers/me) rather than trusting
// any locally stored flag, since the cookie is HttpOnly and the source
// of truth always lives on the server.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | authed | guest

  useEffect(() => {
    let cancelled = false;

    getCurrentCustomer()
      .then(() => {
        if (!cancelled) setStatus("authed");
      })
      .catch(() => {
        if (!cancelled) setStatus("guest");
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-500">
        Checking your session...
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
