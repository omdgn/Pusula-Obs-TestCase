import { useState, useEffect } from "react";
import { getMyComments, createComment, updateComment, deleteComment, getMyCourses, getCourseStudents } from "../../services/teacherService";
import { MessageSquare, Loader2, Send, User, Edit, Trash2, Plus } from "lucide-react";

export default function Comments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ studentId: "", content: "" });
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [coursesData, commentsData] = await Promise.all([
          getMyCourses(),
          getMyComments()
        ]);

        setCourses(coursesData);
        setComments(commentsData);

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
          const studentsData = await getCourseStudents(coursesData[0].id);
          setStudents(studentsData);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Veriler yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
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
      const studentsData = await getCourseStudents(courseId);
      setStudents(studentsData);
      setNewComment({ studentId: "", content: "" }); // Reset form
    } catch (err) {
      console.error("Fetch course students error:", err);
      setError("Bu dersin öğrencileri yüklenemedi.");
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.studentId || !newComment.content.trim()) {
      setMessage("Lütfen öğrenci ve yorum içeriği seçin/girin.");
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await createComment({
        studentId: newComment.studentId,
        content: newComment.content.trim()
      });

      setMessage("Yorum başarıyla eklendi!");
      setNewComment({ studentId: "", content: "" });

      // Yorumları yeniden yükle
      const commentsData = await getMyComments();
      setComments(commentsData);
    } catch (err) {
      console.error("Create comment error:", err);
      setMessage("Yorum eklenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      setMessage("Yorum içeriği boş olamaz.");
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await updateComment(commentId, { content: editContent.trim() });

      setMessage("Yorum başarıyla güncellendi!");
      setEditingComment(null);
      setEditContent("");

      // Yorumları yeniden yükle
      const commentsData = await getMyComments();
      setComments(commentsData);
    } catch (err) {
      console.error("Update comment error:", err);
      setMessage("Yorum güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await deleteComment(commentId);

      setMessage("Yorum başarıyla silindi!");

      // Yorumları yeniden yükle
      const commentsData = await getMyComments();
      setComments(commentsData);
    } catch (err) {
      console.error("Delete comment error:", err);
      setMessage("Yorum silinirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
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
          Yorum Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Öğrencilerinize yazdığınız yorumları görüntüle ve yönet
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

      {/* Comments List */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {comments.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mevcut Yorumlar
            </h2>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.studentName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        • {comment.courseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        disabled={saving}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 min-h-[80px]"
                        placeholder="Yorum içeriği..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={saving}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Kaydet"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('tr-TR')} tarihinde eklendi
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Henüz yorum bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Öğrencilerinize ilk yorumunuzu ekleyin.
            </p>
          </div>
        )}
      </div>

      {/* Add New Comment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Yorum Ekle
        </h2>
        <form onSubmit={handleCreateComment} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğrenci Seç
              </label>
              <select
                value={newComment.studentId}
                onChange={(e) => setNewComment(prev => ({ ...prev, studentId: e.target.value }))}
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
                Yorum İçeriği
              </label>
              <textarea
                value={newComment.content}
                onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 min-h-[100px]"
                placeholder="Yorumunuzu buraya yazın..."
                required
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
              <Send className="w-4 h-4" />
            )}
            Yorum Ekle
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