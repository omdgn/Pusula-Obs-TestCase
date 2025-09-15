// src/components/TeacherStudentEnrollment.jsx
import { useState, useEffect } from "react";
import { UserPlus, X, User, Check } from "lucide-react";
import { getAllStudents, addStudentToCourse, getCourseStudents } from "../services/teacherService";

export default function TeacherStudentEnrollment({ courseId, onEnrollmentChange = () => {} }) {
  const [showModal, setShowModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Öğrenci listelerini yükle
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allStudentsData, enrolledStudentsData] = await Promise.all([
        getAllStudents(),
        getCourseStudents(courseId)
      ]);

      setAllStudents(allStudentsData);
      setEnrolledStudents(enrolledStudentsData);

      // Kayıtlı olmayan öğrencileri filtrele
      const enrolledIds = enrolledStudentsData.map(s => s.id);
      const available = allStudentsData.filter(s => !enrolledIds.includes(s.id));
      setAvailableStudents(available);

    } catch (err) {
      console.error("Fetch students error:", err);
      setError("Öğrenci listesi yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Modal açıldığında veri yükle
  useEffect(() => {
    if (showModal) {
      fetchStudents();
    }
  }, [showModal, courseId]);

  // Öğrenci ekleme
  const handleEnrollStudent = async (studentId) => {
    try {
      setEnrolling(studentId);
      setError(null);
      setMessage(null);

      await addStudentToCourse(courseId, studentId);
      setMessage("Öğrenci başarıyla derse eklendi!");

      // Listeleri güncelle
      await fetchStudents();
      onEnrollmentChange();

    } catch (err) {
      console.error("Enroll student error:", err);
      if (err.response?.status === 403) {
        setError("Bu derse öğrenci ekleme yetkiniz bulunmuyor. Sadece kendi derslerinize öğrenci ekleyebilirsiniz.");
      } else {
        setError("Öğrenci eklenirken hata oluştu: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        <UserPlus className="w-4 h-4" />
        Öğrenci Ekle
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Derse Öğrenci Ekle
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

              {/* Loading */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Öğrenciler yükleniyor...</p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {enrolledStudents.length}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Kayıtlı Öğrenci
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {availableStudents.length}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Eklenebilir Öğrenci
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Students */}
                  {availableStudents.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                        Eklenebilir Öğrenciler
                      </h3>
                      {availableStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
                              {student.studentNumber && (
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  Öğrenci No: {student.studentNumber}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnrollStudent(student.id)}
                            disabled={enrolling === student.id}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm"
                          >
                            {enrolling === student.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Ekleniyor...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Ekle
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Eklenebilir Öğrenci Yok
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Tüm öğrenciler bu derse zaten kayıtlı.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}