// src/pages/admin/CourseDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, User, Calendar, Users, Trash2 } from "lucide-react";
import { getCourseById, getCourseStudents, removeStudentFromCourse } from "../../services/adminService";
import StudentEnrollment from "../../components/StudentEnrollment";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Ders detayını ve öğrencilerini yükle
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseData, studentsData] = await Promise.all([
        getCourseById(id),
        getCourseStudents(id)
      ]);

      setCourse(courseData);
      setStudents(studentsData);

    } catch (err) {
      console.error("Fetch course detail error:", err);
      setError("Ders detayları yüklenirken hata oluştu: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Öğrenci çıkarma
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!confirm(`${studentName} adlı öğrenciyi dersten çıkarmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setRemoving(studentId);
      setError(null);
      setMessage(null);

      await removeStudentFromCourse(id, studentId);
      setMessage("Öğrenci başarıyla dersten çıkarıldı!");

      // Öğrenci listesini güncelle
      setStudents(prev => prev.filter(s => s.id !== studentId));

    } catch (err) {
      console.error("Remove student error:", err);
      setError("Öğrenci çıkarılırken hata oluştu: " + (err.response?.data?.message || err.message));
    } finally {
      setRemoving(null);
    }
  };

  // Enrollment değişikliği sonrası refresh
  const handleEnrollmentChange = () => {
    fetchData();
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      InProgress: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200", label: "Devam Ediyor" },
      Completed: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200", label: "Tamamlandı" },
      Cancelled: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200", label: "İptal Edildi" }
    };
    const config = statusConfig[status] || statusConfig.InProgress;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
        <Link
          to="/admin-dashboard/courses"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Derslere Dön
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400 mb-4">Ders bulunamadı.</div>
        <Link
          to="/admin-dashboard/courses"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Derslere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin-dashboard/courses"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          Derslere Dön
        </Link>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300">
          {message}
        </div>
      )}

      {/* Course Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {course.title}
              </h1>
              {getStatusBadge(course.status)}
            </div>
          </div>
        </div>

        {course.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {course.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Öğretmen</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {course.teacher?.fullName || "Atanmamış"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Öğrenci Sayısı</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {students.length} öğrenci
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Oluşturulma</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(course.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Kayıtlı Öğrenciler ({students.length})
          </h2>
          <StudentEnrollment
            courseId={id}
            onEnrollmentChange={handleEnrollmentChange}
          />
        </div>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {student.fullName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {student.email}
                    </div>
                    {student.studentNumber && (
                      <div className="text-xs text-gray-500">
                        No: {student.studentNumber}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student.id, student.fullName)}
                  disabled={removing === student.id}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2"
                  title="Öğrenciyi dersten çıkar"
                >
                  {removing === student.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Henüz kayıtlı öğrenci yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bu derse henüz hiç öğrenci eklenmemiş.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}