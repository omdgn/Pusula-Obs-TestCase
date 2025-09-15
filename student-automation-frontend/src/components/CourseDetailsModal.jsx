// src/components/CourseDetailsModal.jsx
import { useState } from "react";
import { X, BookOpen, User, Calendar, Users, Clock } from "lucide-react";

export default function CourseDetailsModal({ course, students, onClose }) {
  if (!course) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      InProgress: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200", label: "Aktif" },
      Completed: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200", label: "Tamamlandı" },
      Cancelled: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200", label: "İptal Edildi" }
    };
    const config = statusConfig[status] || statusConfig.InProgress;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Ders Detayları
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Course Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {course.title}
              </h3>
              {getStatusBadge(course.status)}
              {course.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-3">
                  {course.description}
                </p>
              )}
            </div>
          </div>

          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Ders Bilgileri
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Durum</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {course.status === "InProgress" ? "Aktif" : course.status === "Completed" ? "Tamamlandı" : "İptal Edildi"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Kayıtlı Öğrenci</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {students?.length || 0} öğrenci
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Oluşturulma</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(course.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Kayıtlı Öğrenciler ({students?.length || 0})
              </h4>

              {students && students.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  ))}
                  {students.length > 5 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-500 py-2">
                      +{students.length - 5} öğrenci daha...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    Henüz kayıtlı öğrenci yok
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {students?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Öğrenci</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {course.status === "InProgress" ? "Aktif" : "Pasif"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Durum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor((new Date() - new Date(course.createdAt)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gün</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}