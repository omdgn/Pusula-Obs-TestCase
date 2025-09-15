// src/pages/dashboard/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  BarChart3,
  CalendarCheck,
  MessageSquare,
  Moon,
  SunMedium,
  ArrowRight,
  Github,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import AuthModal from "../auth/AuthModal";

// Demo chart data
const gradeTrend = [
  { name: "Hafta 1", ort: 72 },
  { name: "Hafta 2", ort: 78 },
  { name: "Hafta 3", ort: 81 },
  { name: "Hafta 4", ort: 79 },
  { name: "Hafta 5", ort: 85 },
  { name: "Hafta 6", ort: 88 },
];

// Kartlar
function StatCard({ icon: Icon, label, value, isDark }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      <div className="flex flex-col items-center">
        <div
          className={`rounded-2xl p-3 mb-2 ${
            isDark
              ? "bg-indigo-900 text-indigo-400"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="text-center">
          <div className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-500"}>
            {label}
          </div>
          <div
            className={`text-2xl font-bold ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, isDark }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow hover:shadow-md hover:-translate-y-0.5 transition-all ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      <div
        className={`flex items-center gap-3 mb-3 ${
          isDark ? "text-indigo-400" : "text-indigo-600"
        }`}
      >
        <div
          className={
            isDark ? "rounded-xl bg-indigo-900 p-2" : "rounded-xl bg-indigo-100 p-2"
          }
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      </div>
      <p
        className={`text-sm leading-relaxed ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { isDark, toggleTheme } = useTheme();
  const [showAuth, setShowAuth] = React.useState(null);

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100"
          : "bg-gradient-to-b from-gray-50 via-indigo-50/30 to-gray-100 text-gray-900"
      }`}
    >
      {/* Top Nav */}
      <header
        className={`sticky top-0 z-30 backdrop-blur border-b shadow-sm ${
          isDark ? "border-gray-800 bg-gray-900/80" : "border-gray-200 bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-600 to-purple-500 text-white shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg">Student Automation</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="#features"
              className={isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"}
            >
              Özellikler
            </a>
            <a
              href="#roles"
              className={isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"}
            >
              Roller
            </a>
            <a
              href="#chart"
              className={isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"}
            >
              Analitik
            </a>
            <a
              href="https://github.com"
              className={`inline-flex items-center gap-1 ${
                isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"
              }`}
              target="_blank"
              rel="noreferrer"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuth("login")}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                isDark
                  ? "border-gray-700 hover:bg-indigo-600 hover:text-white"
                  : "border-gray-300 hover:bg-indigo-600 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" /> Giriş
            </button>
            <button
              onClick={() => setShowAuth("register")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-3 py-2 text-sm shadow hover:opacity-90 transition"
            >
              <UserPlus className="w-4 h-4" /> Kayıt Ol
            </button>
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className={`ml-1 inline-flex items-center justify-center rounded-xl border px-2.5 py-2 transition ${
                isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {isDark ? (
                <SunMedium className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight">
              Uçtan uca{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Öğrenci Otomasyonu
              </span>
            </h1>
            <p
              className={`mt-6 text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Modern React & Tailwind frontend ile; kullanıcı yönetimi, ders CRUD,
              not ve yoklama takibi.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 font-medium shadow hover:scale-105 transition"
              >
                Hemen Başla <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition ${
                  isDark
                    ? "border-gray-700 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                Özellikleri Gör
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <StatCard icon={Users} label="Aktif Öğrenci" value="1.240" isDark={isDark} />
              <StatCard icon={BookOpen} label="Açık Ders" value="48" isDark={isDark} />
              <StatCard icon={CalendarCheck} label="Yoklama" value="%97" isDark={isDark} />
            </div>
          </div>

          {/* Chart */}
          <div className="lg:pl-8">
            <div
              className={`rounded-3xl p-5 shadow-md ${
                isDark
                  ? "border border-gray-700 bg-gray-800"
                  : "border border-gray-200 bg-white"
              }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Örnek Başarı Grafiği
              </h3>
              <div id="chart" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#9ca3af" : "#6b7280",
                      }}
                    />
                    <YAxis
                      domain={[60, 100]}
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#9ca3af" : "#6b7280",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: 8,
                        color: isDark ? "#f9fafb" : "#111827",
                      }}
                    />
                    <defs>
                      <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="ort"
                      stroke="url(#colorLine)"
                      strokeWidth={3}
                      dot={{
                        r: 6,
                        fill: "#6366f1",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#a855f7",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p
                className={`mt-3 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Demo verisidir. Gerçek veriler giriş yapan kullanıcının rolüne göre gelir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={isDark ? "py-20 bg-gray-900" : "py-20 bg-gray-50"}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Öne Çıkan Özellikler</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={GraduationCap}
              title="Kullanıcı Yönetimi"
              desc="JWT tabanlı Auth ile güvenli oturum."
              isDark={isDark}
            />
            <FeatureCard
              icon={Users}
              title="Öğrenci/Öğretmen"
              desc="Admin CRUD, Teacher & Student görünürlük."
              isDark={isDark}
            />
            <FeatureCard
              icon={BookOpen}
              title="Ders Yönetimi"
              desc="Kendi derslerim, öğrenci ekleme/çıkarma."
              isDark={isDark}
            />
            <FeatureCard
              icon={BarChart3}
              title="Notlar"
              desc="Not ekleme/güncelleme, öğrenci ortalamaları."
              isDark={isDark}
            />
            <FeatureCard
              icon={CalendarCheck}
              title="Devamsızlık"
              desc="Hızlı yoklama kaydı, ders bazlı filtreler."
              isDark={isDark}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Yorumlar"
              desc="Öğretmenden öğrenciye geri bildirim."
              isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className={isDark ? "py-20 bg-gray-950" : "py-20 bg-white"}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Roller</h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Admin, Öğretmen ve Öğrenci rolleri için ayrı dashboard ve yetkilendirme.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-8 border-t ${
          isDark
            ? "border-gray-700 bg-gray-900 text-gray-400"
            : "border-gray-200 bg-white text-gray-500"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-sm gap-3">
          <p>© {new Date().getFullYear()} Student Automation</p>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className={isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"}
            >
              Özellikler
            </a>
            <a
              href="#roles"
              className={isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"}
            >
              Roller
            </a>
            <Link
              to="/register"
              className={`inline-flex items-center gap-1 ${
                isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Kayıt Ol
            </Link>
          </div>
        </div>
      </footer>

      {showAuth && (
        <AuthModal
          mode={showAuth} // "login" veya "register"
          onClose={() => setShowAuth(null)}
        />
      )}
    </div>
  );
}
