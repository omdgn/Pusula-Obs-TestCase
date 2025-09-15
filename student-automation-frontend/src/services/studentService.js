// src/services/studentService.js
import api from "../utils/axiosInstance";

// Öğrenci kendi bilgilerini görüntüle
export const getMyProfile = async () => {
  const response = await api.get("/api/student/me");
  return response.data;
};

// Öğrenci profil bilgilerini güncelle
export const updateMyProfile = async (profileData) => {
  // Önce mevcut profili al ki ID'yi öğrenelim
  const currentProfile = await getMyProfile();
  const response = await api.put(`/api/student/${currentProfile.id}`, profileData);
  return response.data;
};

// Öğrenci kendi derslerini görüntüle - Backend'de Student için course endpoint'i yok!
// Grade'lerden course bilgilerini çıkarıyoruz çünkü response'da course objesi var
export const getMyCourses = async () => {
  try {
    // Önce notlarımı al, oradan dersleri çıkar
    const response = await api.get("/api/grade/my");
    const grades = response.data;

    // Unique course'ları çıkar - response'da course objesi var!
    const uniqueCourses = grades.reduce((acc, grade) => {
      // Aynı course'dan birden fazla not olabilir, unique olanları al
      const existingCourse = acc.find(course => course.id === grade.courseId);

      if (!existingCourse && grade.course) {
        acc.push({
          id: grade.course.id,
          courseId: grade.course.id,
          title: grade.course.title,
          courseName: grade.course.title,
          description: grade.course.description || "Ders açıklaması bulunmuyor",
          status: grade.course.status || "InProgress",
          teacherName: grade.teacher?.fullName || grade.course.teacher?.fullName || "Öğretmen bilgisi yok",
          teacherId: grade.teacherId,
          createdAt: grade.course.createdAt,
          updatedAt: grade.createdAt
        });
      }
      return acc;
    }, []);

    return uniqueCourses;
  } catch (error) {
    // Eğer grade'ler de yoksa boş array döndür
    console.warn("Could not fetch courses from grades, returning empty array");
    return [];
  }
};

// Öğrenci kendi notlarını görüntüle
export const getMyGrades = async () => {
  const response = await api.get("/api/grade/my");

  // Response'dan daha zengin bilgi çıkaralım
  const grades = response.data.map(grade => ({
    id: grade.id,
    score: grade.score,
    description: grade.description,
    courseId: grade.courseId,
    courseName: grade.course?.title || "Bilinmeyen Ders",
    teacherName: grade.teacher?.fullName || grade.course?.teacher?.fullName || "Bilinmeyen Öğretmen",
    createdAt: grade.createdAt,
    updatedAt: grade.createdAt
  }));

  return grades;
};

// Öğrenci kendi devamsızlık kayıtlarını görüntüle
export const getMyAttendance = async () => {
  const response = await api.get("/api/attendance/my");

  // Response'dan zengin bilgi çıkaralım (attendance'da da course objesi olabilir)
  const attendances = response.data.map(attendance => ({
    id: attendance.id,
    studentId: attendance.studentId,
    courseId: attendance.courseId,
    courseName: attendance.course?.title || "Bilinmeyen Ders",
    status: attendance.status,
    date: attendance.date,
    notes: attendance.notes,
    createdAt: attendance.createdAt,
    updatedAt: attendance.updatedAt || attendance.createdAt
  }));

  return attendances;
};

// Öğrenci kendisiyle ilgili yorumları görüntüle
export const getMyComments = async () => {
  const response = await api.get("/api/comment/my");

  // Response'dan zengin bilgi çıkaralım
  const comments = response.data.map(comment => ({
    id: comment.id,
    content: comment.content,
    studentId: comment.studentId,
    courseId: comment.courseId,
    courseName: comment.course?.title || "Bilinmeyen Ders",
    teacherId: comment.teacherId,
    teacherName: comment.teacher?.fullName || "Bilinmeyen Öğretmen",
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt || comment.createdAt
  }));

  return comments;
};

// Öğrenci için yorum detayı görüntüle
export const getStudentComments = async (studentId) => {
  const response = await api.get(`/api/comment/student/${studentId}`);
  return response.data;
};