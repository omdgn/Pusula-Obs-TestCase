// src/services/teacherService.js
import api from "../utils/axiosInstance";

// Öğretmen kendi bilgilerini görüntüle
export const getMyProfile = async () => {
  const response = await api.get("/api/teacher/me");
  return response.data;
};

// Öğretmen profil bilgilerini güncelle
export const updateMyProfile = async (profileData) => {
  // Önce mevcut profili al ki ID'yi öğrenelim
  const currentProfile = await getMyProfile();
  const response = await api.put(`/api/teacher/${currentProfile.id}`, profileData);
  return response.data;
};

// Öğretmen kendi derslerini görüntüle
export const getMyCourses = async () => {
  const response = await api.get("/api/course/my");

  // Response'dan zengin bilgi çıkaralım
  const courses = response.data.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description || "Ders açıklaması bulunmuyor",
    status: course.status,
    teacherId: course.teacherId,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    studentsCount: course.studentsCount || 0
  }));

  return courses;
};

// Dersin durumunu güncelle
export const updateCourseStatus = async (courseId, status) => {
  const response = await api.patch(`/api/course/${courseId}/status`, { status });
  return response.data;
};

// Derse öğrenci ekle
export const addStudentToCourse = async (courseId, studentId) => {
  const response = await api.post(`/api/course/${courseId}/students/${studentId}`);
  return response.data;
};

// Dersten öğrenci çıkar
export const removeStudentFromCourse = async (courseId, studentId) => {
  const response = await api.delete(`/api/course/${courseId}/students/${studentId}`);
  return response.data;
};

// Dersin öğrencilerini görüntüle
export const getCourseStudents = async (courseId) => {
  const response = await api.get(`/api/course/${courseId}/students`);
  return response.data;
};

// Ders detayını görüntüle
export const getCourseById = async (courseId) => {
  const response = await api.get(`/api/course/${courseId}`);
  return response.data;
};

// Öğretmen kendi yorumlarını görüntüle
export const getMyComments = async () => {
  const response = await api.get("/api/comment/teacher/my");

  // Response'dan zengin bilgi çıkaralım
  const comments = response.data.map(comment => ({
    id: comment.id,
    content: comment.content,
    studentId: comment.studentId,
    studentName: comment.student?.fullName || "Bilinmeyen Öğrenci",
    courseId: comment.courseId,
    courseName: comment.course?.title || "Bilinmeyen Ders",
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt || comment.createdAt
  }));

  return comments;
};

// Yorum oluştur
export const createComment = async (commentData) => {
  const response = await api.post("/api/comment", commentData);
  return response.data;
};

// Yorum güncelle
export const updateComment = async (commentId, commentData) => {
  const response = await api.put(`/api/comment/${commentId}`, commentData);
  return response.data;
};

// Yorum sil
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/api/comment/${commentId}`);
  return response.data;
};

// Öğrenci yorumlarını görüntüle
export const getStudentComments = async (studentId) => {
  const response = await api.get(`/api/comment/student/${studentId}`);
  return response.data;
};

// Not oluştur
export const createGrade = async (gradeData) => {
  const response = await api.post("/api/grade", gradeData);
  return response.data;
};

// Not güncelle
export const updateGrade = async (gradeId, gradeData) => {
  const response = await api.put(`/api/grade/${gradeId}`, gradeData);
  return response.data;
};

// Not sil
export const deleteGrade = async (gradeId) => {
  const response = await api.delete(`/api/grade/${gradeId}`);
  return response.data;
};

// Ders notlarını görüntüle
export const getCourseGrades = async (courseId) => {
  const response = await api.get(`/api/grade/course/${courseId}`);

  // Response'dan zengin bilgi çıkaralım
  const grades = response.data.map(grade => ({
    id: grade.id,
    score: grade.score,
    description: grade.description,
    studentId: grade.studentId,
    studentName: grade.student?.fullName || "Bilinmeyen Öğrenci",
    courseId: grade.courseId,
    courseName: grade.course?.title || "Bilinmeyen Ders",
    createdAt: grade.createdAt,
    updatedAt: grade.updatedAt || grade.createdAt
  }));

  return grades;
};

// Yoklama kaydı oluştur
export const createAttendanceRecord = async (attendanceData) => {
  const response = await api.post("/api/attendance/record", attendanceData);
  return response.data;
};

// Yoklama güncelle
export const updateAttendance = async (attendanceId, attendanceData) => {
  const response = await api.put(`/api/attendance/${attendanceId}`, attendanceData);
  return response.data;
};

// Yoklama sil
export const deleteAttendance = async (attendanceId) => {
  const response = await api.delete(`/api/attendance/${attendanceId}`);
  return response.data;
};

// Öğrenci yoklama kayıtlarını görüntüle
export const getStudentAttendance = async (studentId) => {
  const response = await api.get(`/api/attendance/student/${studentId}`);
  return response.data;
};

// Ders yoklama kayıtlarını görüntüle
export const getCourseAttendance = async (courseId) => {
  const response = await api.get(`/api/attendance/course/${courseId}`);

  // Response'dan zengin bilgi çıkaralım
  const attendance = response.data.map(record => ({
    id: record.id,
    studentId: record.studentId,
    studentName: record.student?.fullName || "Bilinmeyen Öğrenci",
    courseId: record.courseId,
    courseName: record.course?.title || "Bilinmeyen Ders",
    status: record.status,
    date: record.date,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt || record.createdAt
  }));

  return attendance;
};

// Tarih bazlı yoklama kayıtlarını görüntüle
export const getAttendanceByDate = async (date) => {
  const response = await api.get(`/api/attendance/date/${date}`);
  return response.data;
};

// Öğrenci ve ders bazlı yoklama kayıtları
export const getStudentCourseAttendance = async (studentId, courseId) => {
  const response = await api.get(`/api/attendance/student/${studentId}/course/${courseId}`);
  return response.data;
};

// Tüm öğrencileri görüntüle (Teacher için)
export const getAllStudents = async () => {
  const response = await api.get("/api/student");
  return response.data;
};
