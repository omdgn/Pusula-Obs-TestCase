// src/components/GradesModal.jsx
import { useState, useEffect } from "react";
import { X, Plus, Save, User, Award } from "lucide-react";
import { getCourseStudents, createGrade, getCourseGrades } from "../services/teacherService";

export default function GradesModal({ courseId, courseName, onClose }) {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [existingGrades, setExistingGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsData, gradesData] = await Promise.all([
          getCourseStudents(courseId),
          getCourseGrades(courseId)
        ]);

        setStudents(studentsData);

        // Group existing grades by student
        const existingGradesByStudent = {};
        gradesData.forEach(grade => {
          if (!existingGradesByStudent[grade.studentId]) {
            existingGradesByStudent[grade.studentId] = [];
          }
          existingGradesByStudent[grade.studentId].push(grade);
        });
        setExistingGrades(existingGradesByStudent);

        // Initialize new grades
        const initialGrades = {};
        studentsData.forEach(student => {
          initialGrades[student.id] = {
            score: '',
            description: ''
          };
        });
        setGrades(initialGrades);

      } catch (err) {
        console.error("Fetch data error:", err);
        setError("Veriler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // Filter students with valid grades
      const gradesToSave = Object.entries(grades).filter(([studentId, grade]) =>
        grade.score && grade.score.trim() !== ''
      );

      if (gradesToSave.length === 0) {
        setError("En az bir öğrenci için not girmelisiniz.");
        return;
      }

      // Save grades
      const promises = gradesToSave.map(([studentId, grade]) =>
        createGrade({
          studentId: studentId,
          courseId: courseId,
          score: parseFloat(grade.score),
          description: grade.description || `${courseName} - ${new Date().toLocaleDateString('tr-TR')}`
        })
      );

      await Promise.all(promises);
      setMessage(`${gradesToSave.length} öğrenci için not başarıyla kaydedildi!`);

      // Reset grades
      const resetGrades = {};
      students.forEach(student => {
        resetGrades[student.id] = {
          score: '',
          description: ''
        };
      });
      setGrades(resetGrades);

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Save grades error:", err);
      setError("Notlar kaydedilirken hata oluştu: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateAverage = (studentGrades) => {
    if (!studentGrades || studentGrades.length === 0) return null;
    const sum = studentGrades.reduce((acc, grade) => acc + grade.score, 0);
    return (sum / studentGrades.length).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Not Girişi
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

          {/* Students and Grades */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Öğrenciler yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                Öğrenciler ({students.length})
              </h3>

              {students.map((student) => {
                const studentExistingGrades = existingGrades[student.id] || [];
                const average = calculateAverage(studentExistingGrades);

                return (
                  <div
                    key={student.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    {/* Student Header */}
                    <div className="flex items-center justify-between mb-3">
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

                      {average && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className={`font-medium ${getGradeColor(parseFloat(average))}`}>
                            Ortalama: {average}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Existing Grades */}
                    {studentExistingGrades.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mevcut Notlar:</div>
                        <div className="flex flex-wrap gap-2">
                          {studentExistingGrades.map((grade, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(grade.score)} bg-gray-100 dark:bg-gray-700`}
                            >
                              {grade.score} {grade.description && `- ${grade.description}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Grade Input */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Not (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grades[student.id]?.score || ''}
                          onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                          placeholder="85"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Açıklama (İsteğe bağlı)
                        </label>
                        <input
                          type="text"
                          value={grades[student.id]?.description || ''}
                          onChange={(e) => handleGradeChange(student.id, 'description', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                          placeholder="Vize sınavı, ödev, vs."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Notları Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}