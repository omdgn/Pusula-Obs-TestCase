// src/components/Navbar.jsx
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  User, LogOut, Moon, SunMedium, GraduationCap, Bell
} from "lucide-react";

export default function Navbar({ title = "Dashboard", showNotifications = true }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur-sm ${
        isDark
          ? "bg-gray-900/90 border-gray-700"
          : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-br from-indigo-600 to-purple-500 text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span
                className={`font-semibold text-lg ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Student Portal
              </span>
            </div>
            <div className="hidden md:block">
              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                /
              </span>
              <span
                className={`ml-2 text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {title}
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {showNotifications && (
              <button
                className={`relative p-2 rounded-lg transition ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${
                isDark
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {isDark ? <SunMedium className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? "bg-indigo-900 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {user?.fullName}
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user?.role}
                </div>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "text-red-400 hover:bg-red-900/20"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}