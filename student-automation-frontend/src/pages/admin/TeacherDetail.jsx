// src/pages/admin/TeacherDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getCoursesByTeacher,
} from "../../services/adminService";
import { User, Mail, BookOpen, Trash2, Edit3 } from "lucide-react";

export default function TeacherDetail() {
  const { id } = useParams(); // URL -> /admin-dashboard/teachers/:id
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherData = await getTeacherById(id);
        setTeacher(teacherData);
        setFormData({ fullName: teacherData.fullName, email: teacherData.email });

        const coursesData = await getCoursesByTeacher(id);
        setCourses(coursesData);
      } catch (err) {
        console.error("Teacher detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateTeacher(id, formData);
      setTeacher(updated);
      setEditMode(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bu öğretmeni silmek istediğinize emin misiniz?")) {
      await deleteTeacher(id);
      navigate("/admin-dashboard/teachers");
    }
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" /> Öğretmen Detayı
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
          <p><Mail className="inline w-4 h-4 mr-2" /> {teacher?.email}</p>
        </div>
      )}

      {/* Courses */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Verdiği Dersler</h2>
        <ul className="space-y-2">
          {courses.map((course) => (
            <li key={course.id} className="border rounded p-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              {course.title}
            </li>
          ))}
        </ul>
        {courses.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">Henüz ders atanmamış.</p>
        )}
      </div>
    </div>
  );
}
