import { useState, useEffect } from "react";
import { getMyCourses, getCourseAttendance, createAttendanceRecord, getCourseStudents } from "../../services/teacherService";
import { CheckCircle, XCircle, Loader2, ClipboardList } from "lucide-react";

export default function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [newRecord, setNewRecord] = useState({ studentId: "", status: "Present", notes: "" });
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
          const [attendanceData, studentsData] = await Promise.all([
            getCourseAttendance(coursesData[0].id),
            getCourseStudents(coursesData[0].id)
          ]);
          setAttendanceRecords(attendanceData);
          setStudents(studentsData);
        }
      } catch (err) {
        console.error("Fetch attendance error:", err);
        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Yoklama verileri yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
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
      const [attendanceData, studentsData] = await Promise.all([
        getCourseAttendance(courseId),
        getCourseStudents(courseId)
      ]);
      setAttendanceRecords(attendanceData);
      setStudents(studentsData);
      setNewRecord({ studentId: "", status: "Present", notes: "" }); // Reset form
    } catch (err) {
      console.error("Fetch course attendance error:", err);
      setError("Bu dersin yoklama verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecordSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.studentId || !selectedCourse) {
      setMessage("Lütfen öğrenci seçin.");
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await createAttendanceRecord({
        studentId: newRecord.studentId,
        courseId: selectedCourse,
        status: newRecord.status,
        date: date,
        notes: newRecord.notes
      });

      setMessage("Yoklama kaydı başarıyla eklendi!");
      setNewRecord({ studentId: "", status: "Present", notes: "" });

      // Yoklama kayıtlarını yeniden yükle
      const attendanceData = await getCourseAttendance(selectedCourse);
      setAttendanceRecords(attendanceData);
    } catch (err) {
      console.error("Create attendance error:", err);
      setMessage("Yoklama kaydı eklenirken bir hata oluştu.");
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
          Yoklama Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Öğrencilerin yoklama kayıtlarını görüntüle ve yeni kayıtlar ekle
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

      {/* Attendance Records */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {attendanceRecords.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Yoklama Kayıtları
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Öğrenci
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Notlar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {record.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                          record.status === "Present"
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {record.status === "Present" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {record.status === "Present" ? "Geldi" : "Gelmedi"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {new Date(record.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Henüz yoklama kaydı bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bu ders için henüz yoklama alınmamış.
            </p>
          </div>
        )}
      </div>

      {/* Add New Attendance Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Yeni Yoklama Kaydı Ekle
        </h2>
        <form onSubmit={handleNewRecordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğrenci Seç
              </label>
              <select
                value={newRecord.studentId}
                onChange={(e) => setNewRecord(prev => ({ ...prev, studentId: e.target.value }))}
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
                Tarih
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durum
              </label>
              <select
                value={newRecord.status}
                onChange={(e) => setNewRecord(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
              >
                <option value="Present">Geldi</option>
                <option value="Absent">Gelmedi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notlar (Opsiyonel)
              </label>
              <input
                type="text"
                value={newRecord.notes}
                onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                placeholder="Notlar"
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
              <ClipboardList className="w-4 h-4" />
            )}
            Yoklama Kaydı Ekle
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