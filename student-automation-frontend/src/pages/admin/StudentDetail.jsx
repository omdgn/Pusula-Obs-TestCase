// src/pages/admin/StudentDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentComments,
  getStudentAttendance
} from "../../services/adminService";
import { User, Mail, BookOpen, Trash2, Edit3 } from "lucide-react";

export default function StudentDetail() {
  const { id } = useParams(); // URL -> /admin-dashboard/students/:id
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [comments, setComments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await getStudentById(id);
        setStudent(studentData);
        setFormData({ fullName: studentData.fullName, email: studentData.email });

        const [commentsData, attendanceData] = await Promise.all([
          getStudentComments(id),
          getStudentAttendance(id),
        ]);

        setComments(commentsData);
        setAttendance(attendanceData);
      } catch (err) {
        console.error("Student detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateStudent(id, formData);
      setStudent(updated);
      setEditMode(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
      await deleteStudent(id);
      navigate("/admin-dashboard/students");
    }
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" /> Öğrenci Detayı
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Düzenle
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Sil
          </button>
        </div>
      </div>

      {editMode ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm">Ad Soyad</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Kaydet
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <p><Mail className="inline w-4 h-4 mr-2" /> {student?.email}</p>
        </div>
      )}

      {/* Attendance */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Yoklama Kayıtları</h2>
        <ul className="space-y-2">
          {attendance.map((a) => (
            <li key={a.id} className="border rounded p-2">
              {a.courseName} - {a.date} → {a.status}
            </li>
          ))}
        </ul>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Yorumlar</h2>
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="border rounded p-2">
              {c.teacherName}: {c.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
