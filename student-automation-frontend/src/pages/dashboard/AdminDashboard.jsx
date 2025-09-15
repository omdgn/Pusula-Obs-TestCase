import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../layouts/AdminLayout";

import Students from "../admin/Students";
import StudentDetail from "../admin/StudentDetail";
import Teachers from "../admin/Teachers";
import TeacherDetail from "../admin/TeacherDetail";
import Courses from "../admin/Courses";
import CourseDetail from "../admin/CourseDetail";

import { getDashboardStats } from "../../services/adminService";
import {
  Users,
  UserCheck,
  BookOpen,
  BarChart3,
  TrendingUp,
  Activity
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "indigo", trend = null }) {
  const colorClasses = {
    indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-2xl p-6 shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error("Admin dashboard stats error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Dashboard verileri yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Yeniden Dene
          </button>
          {(error.includes("Yetki hatası") || error.includes("Oturum süresi")) && (
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-600">
          Hoş geldiniz, {user?.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sistem yönetimi ve genel istatistikleri buradan görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Toplam Öğrenci"
          value={stats.totalStudents}
          color="indigo"
          trend="+5.2%"
        />
        <StatCard
          icon={UserCheck}
          label="Toplam Öğretmen"
          value={stats.totalTeachers}
          color="green"
          trend="+2.1%"
        />
        <StatCard
          icon={BookOpen}
          label="Toplam Ders"
          value={stats.totalCourses}
          color="blue"
          trend="+8.3%"
        />
        <StatCard
          icon={Activity}
          label="Aktif Dersler"
          value={stats.activeCourses}
          color="purple"
          trend="+12.5%"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Öğrenci Yönetimi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Öğrencileri görüntüle ve yönet
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Toplam Öğrenci</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{stats.totalStudents}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Öğretmen Yönetimi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Öğretmenleri görüntüle ve yönet
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Toplam Öğretmen</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{stats.totalTeachers}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ders Yönetimi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dersleri görüntüle ve yönet
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Aktif Dersler</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{stats.activeCourses}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.totalCourses > 0 ? (stats.activeCourses / stats.totalCourses) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Sistem Özeti
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {((stats.activeCourses / stats.totalCourses) * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Aktif Ders Oranı</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {(stats.totalStudents / stats.totalTeachers || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Öğrenci/Öğretmen Oranı</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {(stats.totalCourses / stats.totalTeachers || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ders/Öğretmen Oranı</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/teachers/:id" element={<TeacherDetail />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}