import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth();

  // LocalStorage yüklenmeden yönlendirme yapma
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!token || !user) {
    console.warn("ProtectedRoute: token veya user yok, login sayfasına yönlendiriliyor.");
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn("ProtectedRoute: rol uyuşmadı →", user.role, "Beklenen roller:", allowedRoles);
    if (user.role === "Student") return <Navigate to="/student-dashboard" replace />;
    if (user.role === "Teacher") return <Navigate to="/teacher-dashboard" replace />;
    if (user.role === "Admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
