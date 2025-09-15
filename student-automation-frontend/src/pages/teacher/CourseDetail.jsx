import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, addStudentToCourse, removeStudentFromCourse, getCourseStudents } from "../../services/teacherService";
import { UserPlus, BookOpen, Calendar, Loader2, Users, Trash2, Eye } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStudentId, setNewStudentId] = useState("");
  const [adding, setAdding] = useState(false);
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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentId.trim()) {
      setMessage("Lütfen öğrenci ID'si girin.");
      return;
    }

    try {
      setAdding(true);
      setMessage(null);

      await addStudentToCourse(id, parseInt(newStudentId));
      setMessage("Öğrenci başarıyla eklendi!");
      setNewStudentId("");

      // Öğrenci listesini yeniden yükle
      const studentsData = await getCourseStudents(id);
      setStudents(studentsData);
    } catch (err) {
      console.error("Add student error:", err);
      setMessage("Öğrenci eklenirken bir hata oluştu.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Bu öğrenciyi dersten çıkarmak istediğinize emin misiniz?")) {
      return;
    }

    try {
      setAdding(true);
      setMessage(null);

      await removeStudentFromCourse(id, studentId);
      setMessage("Öğrenci başarıyla dersten çıkarıldı!");

      // Öğrenci listesini yeniden yükle
      const studentsData = await getCourseStudents(id);
      setStudents(studentsData);
    } catch (err) {
      console.error("Remove student error:", err);
      setMessage("Öğrenci çıkarılırken bir hata oluştu.");
    } finally {
      setAdding(false);
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

      {/* Add Student Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Öğrenci Ekle
        </h2>
        <form onSubmit={handleAddStudent} className="flex gap-3">
          <input
            type="number"
            placeholder="Öğrenci ID'si"
            value={newStudentId}
            onChange={(e) => setNewStudentId(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {adding ? "Ekleniyor..." : "Ekle"}
          </button>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Kayıtlı Öğrenciler ({students.length})
        </h2>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Öğrenci ID: ${student.id}`)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    disabled={adding}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Henüz öğrenci eklenmemiş
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bu derse henüz öğrenci kaydı yapılmamış.
            </p>
          </div>
        )}
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