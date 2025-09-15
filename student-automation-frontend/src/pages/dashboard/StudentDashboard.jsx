// src/pages/dashboard/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentLayout from "../../layouts/StudentLayout";
import Chart from "../../components/Chart";
import MyProfile from "../student/MyProfile";
import MyCourses from "../student/MyCourses";
import MyGrades from "../student/MyGrades";
import MyAttendance from "../student/MyAttendance";
import { getMyCourses, getMyGrades, getMyAttendance, getMyComments } from "../../services/studentService";
import {
  User, BookOpen, BarChart3, CalendarCheck, MessageSquare,
  GraduationCap, Clock, Star, TrendingUp
} from "lucide-react";

function ProfileCard({ user }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-600">
            {user?.fullName || "Öğrenci"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user?.email}
          </p>
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400">
            Öğrenci
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-2xl p-6 shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="rounded-xl p-4 shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-600">
          {course.title}
        </h4>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            course.status === "InProgress"
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
              : "bg-gray-600 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          {course.status === "InProgress" ? "Devam Ediyor" : "Tamamlandı"}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {course.description || "Ders açıklaması bulunmuyor"}
      </p>
      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Öğretmen: {course.teacherName}
        </span>
      </div>
    </div>
  );
}

function GradeChart({ grades }) {
  // Not verilerini grafik için dönüştür
  const chartData = grades.map((grade, index) => ({
    name: `Not ${index + 1}`,
    score: grade.score,
    course: grade.courseName
  }));

  return (
    <Chart
      type="line"
      data={chartData}
      title="Not Trendim"
      dataKey="score"
      xAxisKey="name"
      height={300}
      showGrid={true}
      showTooltip={true}
    />
  );
}

function DashboardHome() {
  const { user, token } = useAuth();
  const [studentData, setStudentData] = useState({
    courses: [],
    grades: [],
    attendance: [],
    comments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API'den verileri çek
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [coursesData, gradesData, attendanceData, commentsData] = await Promise.all([
          getMyCourses(),
          getMyGrades(),
          getMyAttendance(),
          getMyComments()
        ]);

        setStudentData({
          courses: coursesData,
          grades: gradesData,
          attendance: attendanceData,
          comments: commentsData
        });
      } catch (err) {
        console.error("Dashboard data fetch error:", err);

        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Veriler yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const averageGrade = studentData.grades.length > 0
    ? Math.round(studentData.grades.reduce((sum, grade) => sum + grade.score, 0) / studentData.grades.length)
    : 0;

  const attendanceRate = studentData.attendance.length > 0
    ? Math.round((studentData.attendance.filter(a => a.status === "Present").length / studentData.attendance.length) * 100)
    : 0;

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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-600">
          Hoş geldin, {user?.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          İşte senin akademik durumun.
        </p>
      </div>

      {/* Profile Section */}
      <div className="mb-8">
        <ProfileCard user={user} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          label="Aktif Derslerim"
          value={studentData.courses.filter(c => c.status === "InProgress").length}
          color="indigo"
        />
        <StatCard
          icon={BarChart3}
          label="Not Ortalaması"
          value={averageGrade}
          color="green"
        />
        <StatCard
          icon={CalendarCheck}
          label="Devam Oranı"
          value={`${attendanceRate}%`}
          color="blue"
        />
        <StatCard
          icon={MessageSquare}
          label="Yorumlar"
          value={studentData.comments.length}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Courses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-600">
            Derslerim
          </h2>
          <div className="space-y-4">
            {studentData.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Grades Chart */}
        <div>
          <GradeChart grades={studentData.grades} />
        </div>
      </div>

      {/* Recent Comments */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-600">
          Son Yorumlar
        </h2>
        <div className="rounded-2xl p-6 shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {studentData.comments.length > 0 ? (
            <div className="space-y-4">
              {studentData.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-600">
                      {comment.teacherName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.courseName} - {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Henüz yorum bulunmuyor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/grades" element={<MyGrades />} />
        <Route path="/attendance" element={<MyAttendance />} />
        <Route path="*" element={<Navigate to="/student-dashboard" replace />} />
      </Routes>
    </StudentLayout>
  );
}