import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, removeStudentFromCourse, getCourseStudents } from "../../services/teacherService";
import { UserPlus, BookOpen, Calendar, Loader2, Users, Trash2, Eye } from "lucide-react";
import TeacherStudentEnrollment from "../../components/TeacherStudentEnrollment";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
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
        console.error("Course fetch error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Ders bilgileri yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Enrollment değişikliği sonrası refresh
  const handleEnrollmentChange = () => {
    const fetchStudentsData = async () => {
      try {
        const studentsData = await getCourseStudents(id);
        setStudents(studentsData);
      } catch (err) {
        console.error("Refresh students error:", err);
      }
    };
    fetchStudentsData();
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Ders bulunamadı
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Bu ders mevcut değil veya erişim yetkiniz bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {course.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {course.description || "Ders açıklaması bulunmuyor."}
        </p>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ders Durumu</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {course.status === "InProgress" ? "Aktif" : course.status === "Completed" ? "Tamamlandı" : "Beklemede"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kayıtlı Öğrenci</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {students.length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Oluşturulma</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date(course.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
        </div>
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

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Kayıtlı Öğrenciler ({students.length})
          </h2>
          <TeacherStudentEnrollment
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
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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