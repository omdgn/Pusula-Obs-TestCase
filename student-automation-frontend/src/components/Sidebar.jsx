// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { GraduationCap } from "lucide-react";

export default function Sidebar({ menuItems, title = "Portal" }) {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <div
      className={`w-64 h-screen fixed left-0 top-0 ${
        isDark
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      } border-r overflow-y-auto`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-br from-indigo-600 to-purple-500 text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span
            className={`font-semibold ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems?.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                    isActive
                      ? isDark
                        ? "bg-indigo-900 text-indigo-400 border border-indigo-800"
                        : "bg-indigo-100 text-indigo-600 border border-indigo-200"
                      : isDark
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.badge && (
                    <span
                      className={`ml-auto px-2 py-1 text-xs rounded-full ${
                        isDark
                          ? "bg-indigo-900 text-indigo-400"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}