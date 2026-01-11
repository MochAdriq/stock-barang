import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user } = useAuth();

  // Kalau tidak ada user (belum login), tendang ke halaman Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kalau aman, silakan lanjut (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
