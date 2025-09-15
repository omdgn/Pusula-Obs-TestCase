// src/components/AttendanceModal.jsx
import { useState, useEffect } from "react";
import { X, Check, X as XIcon, Calendar, User } from "lucide-react";
import { getCourseStudents, createAttendanceRecord } from "../services/teacherService";

export default function AttendanceModal({ courseId, courseName, onClose }) {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await getCourseStudents(courseId);
        setStudents(studentsData);

        // Initialize attendance as present for all students
        const initialAttendance = {};
        studentsData.forEach(student => {
          initialAttendance[student.id] = 'Present';
        });
        setAttendance(initialAttendance);
      } catch (err) {
        console.error("Fetch students error:", err);
        setError("Öğrenci listesi yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // Save attendance for each student
      const promises = students.map(student =>
        createAttendanceRecord({
          studentId: student.id,
          courseId: courseId,
          date: selectedDate,
          status: attendance[student.id] || 'Present',
          notes: ''
        })
      );

      await Promise.all(promises);
      setMessage("Yoklama başarıyla kaydedildi!");

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Save attendance error:", err);
      setError("Yoklama kaydedilirken hata oluştu: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 border-green-300';
      case 'Absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'Late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Yoklama Al
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarih Seçin:
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">
              {message}
            </div>
          )}

          {/* Students List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Öğrenciler yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                Öğrenciler ({students.length})
              </h3>

              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {student.fullName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {student.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {['Present', 'Absent', 'Late'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(student.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                          attendance[student.id] === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'Present' && '✓ Var'}
                        {status === 'Absent' && '✗ Yok'}
                        {status === 'Late' && '⚠ Geç'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Yoklamayı Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}