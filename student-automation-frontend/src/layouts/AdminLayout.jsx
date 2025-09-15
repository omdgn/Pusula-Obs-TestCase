// src/layouts/AdminLayout.jsx
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  BookOpen,
} from "lucide-react";

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Yetki kontrolü (ortak ProtectedRoute kullanıyorsan bu kısım opsiyonel)
  if (!user || user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { icon: Home,      label: "Ana Sayfa",         path: "/admin-dashboard" },
    { icon: Users,     label: "Öğrenci Yönetimi",  path: "/admin-dashboard/students" },
    { icon: UserCheck, label: "Öğretmen Yönetimi", path: "/admin-dashboard/teachers" },
    { icon: BookOpen,  label: "Ders Yönetimi",     path: "/admin-dashboard/courses" },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-950 to-black"
          : "bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-100"
      }`}
    >
      {/* Sidebar (ortak component) */}
      <Sidebar menuItems={menuItems} title="Admin Panel" />

      {/* İçerik alanı (Student/Teacher ile aynı hizalama) */}
      <div className="ml-64">
        {/* Navbar (ortak component) */}
        <Navbar title={title} />

        {/* Sayfa içeriği */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
