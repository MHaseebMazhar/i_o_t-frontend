import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token"); // real login check

  if (!token) {
    return <Navigate to="/" replace />; // redirect to login
  }

  return children;
}
