// src/layouts/StudentLayout.jsx
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import {
  User, BookOpen, BarChart3, CalendarCheck, MessageSquare, Home
} from "lucide-react";

export default function StudentLayout({ children, title = "Öğrenci Dashboard" }) {
  const { isDark } = useTheme();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/student-dashboard" },
    { icon: User, label: "Profilim", path: "/student-dashboard/profile" },
    { icon: BookOpen, label: "Derslerim", path: "/student-dashboard/courses" },
    { icon: BarChart3, label: "Notlarım", path: "/student-dashboard/grades" },
    { icon: CalendarCheck, label: "Devamsızlık", path: "/student-dashboard/attendance" },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-950 to-black"
          : "bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-100"
      }`}
    >
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} title="Student Portal" />

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Navbar */}
        <Navbar title={title} />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}