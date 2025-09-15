// src/pages/teacher/Students.jsx
import { useState, useEffect } from "react";
import { getMyCourses, getCourseStudents } from "../../services/teacherService";
import { Users, Mail, Loader2, GraduationCap } from "lucide-react";

export default function Students() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await getMyCourses();
        setCourses(coursesData);

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
          const studentsData = await getCourseStudents(coursesData[0].id);
          setStudents(studentsData);
        }
      } catch (err) {
        console.error("Fetch students error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Öğrenciler yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      setLoading(true);
      const studentsData = await getCourseStudents(courseId);
      setStudents(studentsData);
    } catch (err) {
      console.error("Fetch course students error:", err);
      setError("Bu dersin öğrencileri yüklenemedi.");
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Öğrenciler
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Derslerine kayıtlı öğrencileri görüntüle ve yönet
        </p>
      </div>

      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="mb-6">
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ders Seç:
          </label>
          <select
            id="course-select"
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {s.fullName}
                  </h3>
                  <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                    <Mail className="w-4 h-4" /> {s.email}
                  </p>
                </div>
              </div>

              {/* Öğrenci bilgileri */}
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  Not Ortalaması:{" "}
                  <span className="font-medium">
                    {s.averageGrade ?? "Henüz not yok"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Bu derse kayıtlı öğrenci bulunmuyor
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Öğrencileri eklemek için ders detay sayfasını kullanabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
