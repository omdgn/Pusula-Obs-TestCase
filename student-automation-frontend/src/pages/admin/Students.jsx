// src/pages/admin/Students.jsx
import { useState, useEffect } from "react";
import {
  getAllStudents,
  deleteStudent,
  updateStudent,
  getStudentById,
  getStudentComments,
  getStudentAttendance,
} from "../../services/adminService";
import {
  Users,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Search,
  Plus,
  X,
  BookOpen,
  MessageSquare,
  CalendarDays,
} from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("details"); // details | comments | attendance | edit
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [comments, setComments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentNumber: "",
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const studentsData = await getAllStudents();
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (err) {
        console.error("Fetch students error:", err);
        setError("Öğrenciler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!confirm(`${studentName} adlı öğrenciyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setDeleting(studentId);
      setMessage(null);

      await deleteStudent(studentId);
      setMessage("Öğrenci başarıyla silindi!");

      const updatedStudents = students.filter((s) => s.id !== studentId);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    } catch (err) {
      console.error("Delete student error:", err);
      setMessage("Öğrenci silinirken bir hata oluştu.");
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenModal = async (studentId, tab = "details") => {
    try {
      const student = await getStudentById(studentId);
      setSelectedStudent(student);
      setEditForm({
        fullName: student.fullName || "",
        email: student.email || "",
        phone: student.phone || "",
        studentNumber: student.studentNumber || "",
      });

      if (tab === "comments") {
        const comm = await getStudentComments(studentId);
        setComments(comm);
      }
      if (tab === "attendance") {
        const att = await getStudentAttendance(studentId);
        setAttendance(att);
      }

      setModalTab(tab);
      setShowModal(true);
    } catch (err) {
      console.error("Fetch student detail error:", err);
      setMessage("Öğrenci detayları alınamadı.");
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateStudent(selectedStudent.id, editForm);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setFilteredStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setMessage("Öğrenci başarıyla güncellendi!");
      setShowModal(false);
    } catch (err) {
      console.error("Update student error:", err);
      setMessage("Öğrenci güncellenirken bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-gray-600">Öğrenci Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tüm öğrencileri görüntüle, düzenle ve yönet</p>
        </div>
        <button
          onClick={() => alert("Yeni öğrenci ekleme ileride buradan yapılacak.")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Öğrenci
        </button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Öğrenci ara (isim, email, numara)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{filteredStudents.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{searchTerm ? "Bulunan" : "Toplam"} Öğrenci</div>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.fullName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{student.studentNumber || "Numara yok"}</p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 truncate">{student.email}</span>
              </div>

              {student.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{student.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Kayıt: {new Date(student.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleOpenModal(student.id, "details")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detay
              </button>
              <button
                onClick={() => handleOpenModal(student.id, "edit")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </button>
              <button
                onClick={() => handleOpenModal(student.id, "comments")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Yorumlar
              </button>
              <button
                onClick={() => handleOpenModal(student.id, "attendance")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
              >
                <CalendarDays className="w-4 h-4" />
                Devamsızlık
              </button>
              <button
                onClick={() => handleDeleteStudent(student.id, student.fullName)}
                disabled={deleting === student.id}
                className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {modalTab === "details" && "Öğrenci Detayları"}
                {modalTab === "edit" && "Öğrenci Düzenle"}
                {modalTab === "comments" && "Öğrenci Yorumları"}
                {modalTab === "attendance" && "Öğrenci Devamsızlık"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalTab === "details" && (
              <div>
                <p><strong>Ad Soyad:</strong> {selectedStudent.fullName}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Telefon:</strong> {selectedStudent.phone || "Yok"}</p>
                <p><strong>Numara:</strong> {selectedStudent.studentNumber || "Yok"}</p>
                <p><strong>Kayıt Tarihi:</strong> {new Date(selectedStudent.createdAt).toLocaleDateString("tr-TR")}</p>
              </div>
            )}

            {modalTab === "edit" && (
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numara</label>
                  <input
                    type="text"
                    value={editForm.studentNumber}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, studentNumber: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Kaydet</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600">İptal</button>
                </div>
              </form>
            )}

            {modalTab === "comments" && (
              <div>
                {comments.length > 0 ? (
                  <ul className="space-y-3">
                    {comments.map((c) => (
                      <li key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{c.content}</p>
                        <p className="text-xs text-gray-500">Ders: {c.courseName} | {new Date(c.createdAt).toLocaleDateString("tr-TR")}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Yorum bulunamadı.</p>
                )}
              </div>
            )}

            {modalTab === "attendance" && (
              <div>
                {attendance.length > 0 ? (
                  <ul className="space-y-3">
                    {attendance.map((a) => (
                      <li key={a.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(a.date).toLocaleDateString("tr-TR")} - {a.courseName}
                        </p>
                        <p className="text-xs text-gray-500">Durum: {a.status} | Not: {a.notes || "Yok"}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Devamsızlık kaydı bulunamadı.</p>
                )}
              </div>
            )}
          </div>
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
