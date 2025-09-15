// src/layouts/TeacherLayout.jsx
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import {
  Home,
  BookOpen,
  Users,
  CalendarCheck,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export default function TeacherLayout({ children, title = "Öğretmen Dashboard" }) {
  const { isDark } = useTheme();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/teacher-dashboard" },
    { icon: BookOpen, label: "Derslerim", path: "/teacher-dashboard/my-courses" },
    { icon: Users, label: "Öğrenciler", path: "/teacher-dashboard/students" },
    { icon: CalendarCheck, label: "Yoklama", path: "/teacher-dashboard/attendance" },
    { icon: BarChart3, label: "Notlar", path: "/teacher-dashboard/grades" },
    { icon: MessageSquare, label: "Yorumlar", path: "/teacher-dashboard/comments" },
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
      <Sidebar menuItems={menuItems} title="Teacher Portal" />

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Navbar */}
        <Navbar title={title} />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
