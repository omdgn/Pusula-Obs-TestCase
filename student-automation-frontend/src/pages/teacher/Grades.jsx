import { useState, useEffect } from "react";
import { getMyCourses, getCourseGrades, createGrade, updateGrade, getCourseStudents } from "../../services/teacherService";
import { Loader2, Pencil, BarChart3 } from "lucide-react";

export default function Grades() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [newGrade, setNewGrade] = useState({ studentId: "", score: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await getMyCourses();
        setCourses(coursesData);

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
          const [gradesData, studentsData] = await Promise.all([
            getCourseGrades(coursesData[0].id),
            getCourseStudents(coursesData[0].id)
          ]);
          setGrades(gradesData);
          setStudents(studentsData);
        }
      } catch (err) {
        console.error("Fetch grades error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Notlar yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      setLoading(true);
      const [gradesData, studentsData] = await Promise.all([
        getCourseGrades(courseId),
        getCourseStudents(courseId)
      ]);
      setGrades(gradesData);
      setStudents(studentsData);
      setNewGrade({ studentId: "", score: "", description: "" }); // Reset form
    } catch (err) {
      console.error("Fetch course grades error:", err);
      setError("Bu dersin notları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewGradeSubmit = async (e) => {
    e.preventDefault();
    if (!newGrade.studentId || !newGrade.score || !selectedCourse) {
      setMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await createGrade({
        studentId: newGrade.studentId,
        courseId: selectedCourse,
        score: parseInt(newGrade.score),
        description: newGrade.description
      });

      setMessage("Not başarıyla eklendi!");
      setNewGrade({ studentId: "", score: "", description: "" });

      // Notları yeniden yükle
      const gradesData = await getCourseGrades(selectedCourse);
      setGrades(gradesData);
    } catch (err) {
      console.error("Create grade error:", err);
      setMessage("Not eklenirken bir hata oluştu.");
    } finally {
      setSaving(false);
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Not Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Öğrencilerin notlarını görüntüle ve yeni notlar ekle
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

      {/* Grades List */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {grades.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Mevcut Notlar
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Öğrenci
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Not
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Açıklama
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {grade.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          grade.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          grade.score >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          grade.score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {grade.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {grade.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {new Date(grade.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Henüz not bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bu ders için henüz not girilmemiş.
            </p>
          </div>
        )}
      </div>

      {/* Add New Grade Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Yeni Not Ekle
        </h2>
        <form onSubmit={handleNewGradeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğrenci Seç
              </label>
              <select
                value={newGrade.studentId}
                onChange={(e) => setNewGrade(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Öğrenci seçin...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Not (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newGrade.score}
                onChange={(e) => setNewGrade(prev => ({ ...prev, score: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                placeholder="Not"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama (Opsiyonel)
              </label>
              <input
                type="text"
                value={newGrade.description}
                onChange={(e) => setNewGrade(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                placeholder="Açıklama"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
            Not Ekle
          </button>
        </form>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-center">
          {message}
        </div>
      )}
    </div>
  );
}