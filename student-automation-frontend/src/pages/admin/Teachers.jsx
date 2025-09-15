// src/pages/admin/Teachers.jsx
import { useState, useEffect } from "react";
import {
  getAllTeachers,
  deleteTeacher,
  createTeacher,
  getTeacherById,
  updateTeacher,
  getCoursesByTeacher, // Detayda öğretmenin derslerini göstermek için
  getAllCourses,
} from "../../services/adminService";
import {
  UserCheck,
  Eye,
  Trash2,
  Mail,
  Phone,
  Search,
  Plus,
  X,
  Edit,
  BookOpen,
  Calendar,
} from "lucide-react";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modallar
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Seçimler
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTeacherCourses, setSelectedTeacherCourses] = useState([]);

  // Form state
  const [newTeacher, setNewTeacher] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    title: "",
  });

  // Yardımcılar
  const resetMessageSoon = () => {
    if (resetMessageSoon._t) {
      window.clearTimeout(resetMessageSoon._t);
    }
    resetMessageSoon._t = window.setTimeout(() => setMessage(null), 2500);
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR") : "—");


  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [teachersData, coursesData] = await Promise.all([
          getAllTeachers(),
          getAllCourses()
        ]);

        setTeachers(teachersData);
        setFilteredTeachers(teachersData);
        setCourses(coursesData);   // ✅ courses state dolduruluyor
      } catch (err) {
        console.error("Fetch teachers error:", err);
        setError("Veriler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // İlk yük – öğretmenleri getir
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllTeachers();
        setTeachers(data);
        setFilteredTeachers(data);
      } catch (err) {
        console.error("Fetch teachers error:", err);
        if (err?.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err?.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError(
            "Öğretmenler yüklenirken bir hata oluştu: " +
              (err?.message || "Bilinmeyen hata")
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Arama
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTeachers(teachers);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredTeachers(
      teachers.filter(
        (t) =>
          t.fullName?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.department?.toLowerCase().includes(q) ||
          t.title?.toLowerCase().includes(q) ||
          t.phone?.toLowerCase().includes(q)
      )
    );
  }, [searchTerm, teachers]);

  // Yeni Öğretmen Ekle
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      setMessage("Lütfen zorunlu alanları doldurun.");
      resetMessageSoon();
      return;
    }
    try {
      setSaving(true);
      const created = await createTeacher(newTeacher);
      setTeachers((prev) => [...prev, created]);
      setFilteredTeachers((prev) => [...prev, created]);
      setMessage("Öğretmen başarıyla eklendi!");
      setShowAddForm(false);
      setNewTeacher({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        title: "",
      });
    } catch (err) {
      console.error("Create teacher error:", err);
      if (err?.response?.status === 400) {
        setMessage("Bu email adresi zaten kullanılıyor.");
      } else {
        setMessage("Öğretmen eklenirken bir hata oluştu.");
      }
    } finally {
      setSaving(false);
      resetMessageSoon();
    }
  };


    const [teacherCourses, setTeacherCourses] = useState([]);

    const handleShowDetail = async (teacherId) => {
      try {
        const teacherData = await getTeacherById(teacherId);
        const coursesData = await getCoursesByTeacher(teacherId); // 🔥 eklenen satır
        setSelectedTeacher({ ...teacherData, courses: coursesData });
        setShowDetail(true);
      } catch (err) {
        console.error("Teacher detail error:", err);
        setMessage("Öğretmen detayı yüklenemedi.");
      }
    };


  // Detay modalını aç
  const handleViewDetails = async (id) => {
    try {
      setMessage(null);
      const [teacher, courses] = await Promise.all([
        getTeacherById(id),
        getCoursesByTeacher(id).catch(() => []),
      ]);
      setSelectedTeacher(teacher);
      setSelectedTeacherCourses(Array.isArray(courses) ? courses : []);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Teacher detail error:", err);
      setMessage("Detay bilgisi alınırken bir hata oluştu.");
      resetMessageSoon();
    }
  };

  // Düzenle modalını aç
  const handleOpenEdit = async (id) => {
    try {
      setMessage(null);
      const teacher = await getTeacherById(id);
      setSelectedTeacher(teacher);
      setShowEditModal(true);
    } catch (err) {
      console.error("Get teacher error:", err);
      setMessage("Öğretmen bilgisi alınamadı.");
      resetMessageSoon();
    }
  };

  // Düzenlemeyi kaydet
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    const payload = {
      fullName: selectedTeacher.fullName || "",
      email: selectedTeacher.email || "",
      phone: selectedTeacher.phone || "",
      department: selectedTeacher.department || "",
      title: selectedTeacher.title || "",
    };
    try {
      setSaving(true);
      await updateTeacher(selectedTeacher.id, payload);
      // listeleri güncelle
      setTeachers((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? { ...t, ...payload } : t))
      );
      setFilteredTeachers((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? { ...t, ...payload } : t))
      );
      setMessage("Öğretmen bilgisi güncellendi!");
      setShowEditModal(false);
    } catch (err) {
      console.error("Update teacher error:", err);
      setMessage("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
      resetMessageSoon();
    }
  };

  // Sil
  const handleDeleteTeacher = async (teacherId, teacherName) => {
    const ok = confirm(
      `${teacherName} adlı öğretmeni silmek istediğinize emin misiniz?`
    );
    if (!ok) return;
    try {
      setDeleting(teacherId);
      await deleteTeacher(teacherId);
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      setFilteredTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      setMessage("Öğretmen başarıyla silindi!");
      // detaydaki öğretmeni siliyorsak modalı kapat
      if (selectedTeacher?.id === teacherId) {
        setShowDetailModal(false);
        setSelectedTeacher(null);
        setSelectedTeacherCourses([]);
      }
    } catch (err) {
      console.error("Delete teacher error:", err);
      setMessage("Öğretmen silinirken bir hata oluştu.");
    } finally {
      setDeleting(null);
      resetMessageSoon();
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-gray-600">
            Öğretmen Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tüm öğretmenleri görüntüle, düzenle ve yönet
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Öğretmen
        </button>
      </div>

      {/* Search and Count */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Öğretmen ara (isim, email, bölüm, unvan)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {filteredTeachers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? "Bulunan" : "Toplam"} Öğretmen
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {teacher.fullName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {teacher.title || "Öğretmen"}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {teacher.email}
                </span>
              </div>

              {teacher.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {teacher.phone}
                  </span>
                </div>
              )}

              {(teacher.department || teacher.title) && (
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {[teacher.department, teacher.title].filter(Boolean).join(" • ")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Kayıt: {formatDate(teacher.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => handleViewDetails(teacher.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detay
              </button>
              <button
                onClick={() => handleOpenEdit(teacher.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </button>
              <button
                onClick={() => handleDeleteTeacher(teacher.id, teacher.fullName)}
                disabled={deleting === teacher.id}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? "Öğretmen bulunamadı" : "Henüz öğretmen yok"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? "Arama kriterlerinizi değiştirebilirsiniz."
              : "İlk öğretmeni ekleyerek başlayın."}
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-center">
          {message}
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Yeni Öğretmen Ekle
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={newTeacher.fullName}
                  onChange={(e) =>
                    setNewTeacher((p) => ({ ...p, fullName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="Örn: Ayşe Yılmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) =>
                    setNewTeacher((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="teacher@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Şifre *
                </label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) =>
                    setNewTeacher((p) => ({ ...p, password: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="En az 6 karakter"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={newTeacher.phone}
                    onChange={(e) =>
                      setNewTeacher((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    value={newTeacher.title}
                    onChange={(e) =>
                      setNewTeacher((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="Örn: Dr. Öğr. Üyesi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bölüm
                </label>
                <input
                  type="text"
                  value={newTeacher.department}
                  onChange={(e) =>
                    setNewTeacher((p) => ({ ...p, department: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="Örn: Bilgisayar Mühendisliği"
                />
              </div>

              <div className="flex gap-3 pt-2">
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
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Öğretmen Detayı
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTeacher(null);
                  setSelectedTeacherCourses([]);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Ad Soyad</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedTeacher.fullName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedTeacher.email}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedTeacher.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Bölüm</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedTeacher.department || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Ünvan</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedTeacher.title || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Kayıt Tarihi</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(selectedTeacher.createdAt)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Verdiği Dersler
              </h3>

                {courses.filter(c => c.teacherId === selectedTeacher?.id).length > 0 ? (
                <ul className="space-y-2">
                  {courses
                    .filter(c => c.teacherId === selectedTeacher?.id)
                    .map((c) => (
                      <li
                        key={c.id}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {c.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {c.description || "Açıklama yok"}
                            </p>
                          </div>
                          <span className="ml-3 text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shrink-0">
                            {c.status || "InProgress"}
                          </span>
                        </div>
                        {Array.isArray(c.courseStudents) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Öğrenci sayısı: {c.courseStudents.length}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Bu öğretmene ait ders bulunamadı.
                </p>
              )}
            </div>




            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowEditModal(true);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Düzenle
              </button>
              <button
                onClick={() =>
                  handleDeleteTeacher(selectedTeacher.id, selectedTeacher.fullName)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Öğretmeni Düzenle
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={selectedTeacher.fullName || ""}
                  onChange={(e) =>
                    setSelectedTeacher((p) => ({ ...p, fullName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="Örn: Ayşe Yılmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedTeacher.email || ""}
                  onChange={(e) =>
                    setSelectedTeacher((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="teacher@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={selectedTeacher.phone || ""}
                    onChange={(e) =>
                      setSelectedTeacher((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    value={selectedTeacher.title || ""}
                    onChange={(e) =>
                      setSelectedTeacher((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                    placeholder="Örn: Dr. Öğr. Üyesi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bölüm
                </label>
                <input
                  type="text"
                  value={selectedTeacher.department || ""}
                  onChange={(e) =>
                    setSelectedTeacher((p) => ({ ...p, department: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  placeholder="Örn: Bilgisayar Mühendisliği"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
