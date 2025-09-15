import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TeacherLayout from "../../layouts/TeacherLayout";

import MyCourses from "../teacher/MyCourses";
import CourseDetail from "../teacher/CourseDetail";
import Students from "../teacher/Students";
import Attendance from "../teacher/Attendance";
import Grades from "../teacher/Grades";
import Comments from "../teacher/Comments";

import { getMyCourses, getMyComments, getCourseAttendance } from "../../services/teacherService";
import {
  BookOpen,
  Users,
  CalendarCheck,
  BarChart3,
  MessageSquare,
  User,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-2xl p-6 shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
    </div>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    attendanceRate: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [coursesData, commentsData] = await Promise.all([
          getMyCourses(),
          getMyComments()
        ]);

        let totalStudents = 0;
        let totalAttendanceRecords = 0;
        let presentRecords = 0;

        if (coursesData.length > 0) {
          for (const course of coursesData) {
            try {
              const attendanceData = await getCourseAttendance(course.id);
              totalAttendanceRecords += attendanceData.length;
              presentRecords += attendanceData.filter(a => a.status === "Present").length;
              totalStudents += course.studentsCount || 0;
            } catch (err) {
              console.warn(`Could not fetch attendance for course ${course.id}:`, err);
            }
          }
        }

        const attendanceRate = totalAttendanceRecords > 0
          ? Math.round((presentRecords / totalAttendanceRecords) * 100)
          : 0;

        setStats({
          courses: coursesData.length,
          students: totalStudents,
          attendanceRate,
          comments: commentsData.length,
        });
      } catch (err) {
        console.error("Teacher dashboard stats error:", err);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Hoş geldiniz, {user?.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Buradan derslerinizi, yoklamaları, notları ve yorumları
          yönetebilirsiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={BookOpen} label="Derslerim" value={stats.courses} color="indigo" />
        <StatCard icon={Users} label="Öğrencilerim" value={stats.students} color="green" />
        <StatCard
          icon={CalendarCheck}
          label="Devam Oranı"
          value={`${stats.attendanceRate}%`}
          color="blue"
        />
        <StatCard
          icon={MessageSquare}
          label="Yorumlar"
          value={stats.comments}
          color="purple"
        />
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <TeacherLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/students" element={<Students />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="*" element={<Navigate to="/teacher-dashboard" replace />} />
      </Routes>
    </TeacherLayout>
  );
}
