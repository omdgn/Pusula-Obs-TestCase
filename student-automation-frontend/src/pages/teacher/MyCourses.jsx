import { useState, useEffect } from "react";
import { getMyCourses, getCourseStudents } from "../../services/teacherService";
import {
  BookOpen, Users, Clock, Calendar, CheckCircle, Eye, ClipboardList, BarChart3, Award
} from "lucide-react";
import CourseDetailsModal from "../../components/CourseDetailsModal";
import AttendanceModal from "../../components/AttendanceModal";
import GradesModal from "../../components/GradesModal";

export default function TeacherMyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await getMyCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error("Courses fetch error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Dersler yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleOpenModal = async (course, modalType) => {
    setSelectedCourse(course);
    try {
      const studentsData = await getCourseStudents(course.id);
      setStudents(studentsData);
    } catch (err) {
      console.error("Fetch students error:", err);
      setStudents([]);
    }

    if (modalType === 'details') setShowDetailsModal(true);
    if (modalType === 'attendance') setShowAttendanceModal(true);
    if (modalType === 'grades') setShowGradesModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      InProgress: {
        color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Devam Ediyor"
      },
      Completed: {
        color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Tamamlandı"
      },
      NotStarted: {
        color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
        icon: <Clock className="w-4 h-4" />,
        text: "Başlamadı"
      }
    };
    const badge = badges[status] || badges.NotStarted;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

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
          Verdiğim Dersler
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sorumlu olduğun dersleri yönet
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Ders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Dersler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {courses.filter(c => c.status === "InProgress").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {courses.filter(c => c.status === "Completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Course Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {course.description || "Ders açıklaması bulunmuyor"}
                </p>
              </div>
              {getStatusBadge(course.status)}
            </div>

            {/* Course Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {course.studentCount || 0} öğrenci kayıtlı
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Oluşturulma: {formatDate(course.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Güncellenme: {formatDate(course.updatedAt)}
                </span>
              </div>
            </div>

            {/* Course Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(course, 'details')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Eye className="w-4 h-4" />
                Detaylar
              </button>
              <button
                onClick={() => handleOpenModal(course, 'attendance')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <ClipboardList className="w-4 h-4" />
                Yoklama
              </button>
              <button
                onClick={() => handleOpenModal(course, 'grades')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Award className="w-4 h-4" />
                Not Girişi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Henüz dersin bulunmuyor
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Verdiğin dersler burada listelenecek.
          </p>
        </div>
      )}

      {/* Modals */}
      {showDetailsModal && selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          students={students}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showAttendanceModal && selectedCourse && (
        <AttendanceModal
          courseId={selectedCourse.id}
          courseName={selectedCourse.title}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}

      {showGradesModal && selectedCourse && (
        <GradesModal
          courseId={selectedCourse.id}
          courseName={selectedCourse.title}
          onClose={() => setShowGradesModal(false)}
        />
      )}
    </div>
  );
}
