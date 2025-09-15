// src/pages/admin/Courses.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCourses, deleteCourse, createCourse, getAllTeachers } from "../../services/adminService";
import { BookOpen, Eye, Trash2, Calendar, User, Search, Plus, X } from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    teacherId: "",
    status: "InProgress",
    startDate: "",
    endDate: ""
  });

  // === Fetch Data ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [coursesData, teachersData] = await Promise.all([
          getAllCourses(),
          getAllTeachers()
        ]);
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setTeachers(teachersData);
      } catch (err) {
        console.error("Fetch courses error:", err);
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

    fetchData();
  }, []);

  // === Search Filter ===
  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  // === Delete Course ===
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`${courseTitle} adlı dersi silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      setDeleting(courseId);
      setMessage(null);
      await deleteCourse(courseId);
      setMessage("Ders başarıyla silindi!");
      const updatedCourses = courses.filter(c => c.id !== courseId);
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
    } catch (err) {
      console.error("Delete course error:", err);
      setMessage("Ders silinirken bir hata oluştu.");
    } finally {
      setDeleting(null);
    }
  };

  // === Add Course ===
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.teacherId) {
      setMessage("Lütfen ders adı ve öğretmen seçin.");
      return;
    }
    try {
      setSaving(true);
      setMessage(null);
      const createdCourse = await createCourse(newCourse);
      setMessage("Ders başarıyla eklendi!");
      const updatedCourses = [...courses, createdCourse];
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setNewCourse({
        title: "",
        description: "",
        teacherId: "",
        status: "InProgress",
        startDate: "",
        endDate: ""
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Create course error:", err);
      setMessage("Ders eklenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // === Status Badge ===
  const getStatusBadge = (status) => {
    const statusConfig = {
      InProgress: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200", label: "Devam Ediyor" },
      Completed: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200", label: "Tamamlandı" },
      Cancelled: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200", label: "İptal Edildi" }
    };
    const config = statusConfig[status] || statusConfig.InProgress;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // === Loading / Error ===
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

  // === Render ===
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-gray-400">
            Ders Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tüm dersleri görüntüle, düzenle ve yönet
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Ders
        </button>
      </div>

      {/* Add Course Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Yeni Ders Ekle
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ders Adı *
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 truncate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Öğretmen *
                </label>
                <select
                  value={newCourse.teacherId}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Öğretmen seçin...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Ekleniyor..." : "Ekle"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:text-gray-500"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ders ara (başlık, açıklama, öğretmen)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {filteredCourses.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? "Bulunan" : "Toplam"} Ders
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            {/* Course Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {course.title}
                </h3>
                {getStatusBadge(course.status)}
              </div>
            </div>

            {/* Course Info */}
            <div className="space-y-3 mb-6 flex-1">
              {course.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {course.teacher?.fullName || "Öğretmen atanmamış"}
                </span>
              </div>

              {course.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(course.startDate).toLocaleDateString('tr-TR')}
                    {course.endDate && ` - ${new Date(course.endDate).toLocaleDateString('tr-TR')}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Kayıt: {new Date(course.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <Link
                to={`/admin-dashboard/courses/${course.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detay
              </Link>
              <button
                onClick={() => handleDeleteCourse(course.id, course.title)}
                disabled={deleting === course.id}
                className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? "Ders bulunamadı" : "Henüz ders yok"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "Arama kriterlerinizi değiştirebilirsiniz." : "İlk dersi ekleyerek başlayın."}
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-center">
          {message}
        </div>
      )}
    </div>
  );
}
