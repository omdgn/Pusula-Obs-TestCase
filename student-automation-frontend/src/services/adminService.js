import api from "../utils/axiosInstance";


// === STUDENT MANAGEMENT ===

// Tüm öğrencileri görüntüle
export const getAllStudents = async () => {
  const response = await api.get("/api/student");
  return response.data;
};

// Öğrenci detayını görüntüle
export const getStudentById = async (studentId) => {
  const response = await api.get(`/api/student/${studentId}`);
  return response.data;
};

// Öğrenci bilgilerini güncelle
export const updateStudent = async (studentId, studentData) => {
  const response = await api.put(`/api/student/${studentId}`, studentData);
  return response.data;
};

// Öğrenci sil
export const deleteStudent = async (studentId) => {
  const response = await api.delete(`/api/student/${studentId}`);
  return response.data;
};

// === TEACHER MANAGEMENT ===

// Yeni öğretmen oluştur
export const createTeacher = async (teacherData) => {
  const response = await api.post("/api/teacher", teacherData);
  return response.data;
};

// Tüm öğretmenleri görüntüle
export const getAllTeachers = async () => {
  const response = await api.get("/api/teacher");
  return response.data;
};

// Belirli bir öğretmenin derslerini getir
export const getCoursesByTeacher = async (teacherId) => {
  const response = await api.get(`/api/course/teacher/${teacherId}`);
  return response.data;
};

// Öğretmen detayını görüntüle
export const getTeacherById = async (teacherId) => {
  const response = await api.get(`/api/teacher/${teacherId}`);
  return response.data;
};

// Öğretmen bilgilerini güncelle
export const updateTeacher = async (teacherId, teacherData) => {
  const response = await api.put(`/api/teacher/${teacherId}`, teacherData);
  return response.data;
};

// Öğretmen sil
export const deleteTeacher = async (teacherId) => {
  const response = await api.delete(`/api/teacher/${teacherId}`);
  return response.data;
};

// === COURSE MANAGEMENT ===

// Yeni ders oluştur
export const createCourse = async (courseData) => {
  const response = await api.post("/api/course", courseData);
  return response.data;
};

// Tüm dersleri görüntüle
export const getAllCourses = async () => {
  const response = await api.get("/api/course");
  return response.data;
};

// Öğretmenin kendi derslerini getir
export const getMyCourses = async () => {
  const response = await api.get("/api/course/my");
  return response.data;
};

// Ders detayını görüntüle
export const getCourseById = async (courseId) => {
  const response = await api.get(`/api/course/${courseId}`);
  return response.data;
};

// Dersin öğrencilerini görüntüle
export const getCourseStudents = async (courseId) => {
  const response = await api.get(`/api/course/${courseId}/students`);
  return response.data;
};

// Ders durumunu güncelle (InProgress, Completed, Cancelled)
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

// Ders sil
export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/api/course/${courseId}`);
  return response.data;
};

// === COMMENTS MANAGEMENT ===

// Öğrenci yorumlarını görüntüle
export const getStudentComments = async (studentId) => {
  const response = await api.get(`/api/comment/student/${studentId}`);

  const comments = response.data.map(comment => ({
    id: comment.id,
    content: comment.content,
    studentId: comment.studentId,
    studentName: comment.student?.fullName || "Bilinmeyen Öğrenci",
    teacherId: comment.teacherId,
    teacherName: comment.teacher?.fullName || "Bilinmeyen Öğretmen",
    courseId: comment.courseId,
    courseName: comment.course?.title || "Bilinmeyen Ders",
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt || comment.createdAt
  }));

  return comments;
};

// Yorum detayını görüntüle
export const getCommentById = async (commentId) => {
  const response = await api.get(`/api/comment/${commentId}`);
  return response.data;
};

// === GRADES MANAGEMENT ===

// Not detayını görüntüle
export const getGradeById = async (gradeId) => {
  const response = await api.get(`/api/grade/${gradeId}`);
  return response.data;
};

// === ATTENDANCE MANAGEMENT ===

// Öğrenci yoklama kayıtlarını görüntüle
export const getStudentAttendance = async (studentId) => {
  const response = await api.get(`/api/attendance/student/${studentId}`);

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

// Öğrenci-ders bazlı yoklama kayıtları
export const getStudentCourseAttendance = async (studentId, courseId) => {
  const response = await api.get(`/api/attendance/student/${studentId}/course/${courseId}`);
  return response.data;
};

// Yoklama detayını görüntüle
export const getAttendanceById = async (attendanceId) => {
  const response = await api.get(`/api/attendance/${attendanceId}`);
  return response.data;
};

// === DASHBOARD STATS ===

// Dashboard istatistikleri için yardımcı fonksiyon
export const getDashboardStats = async () => {
  try {
    const [studentsData, teachersData, coursesData] = await Promise.all([
      getAllStudents(),
      getAllTeachers(),
      getAllCourses()
    ]);

    return {
      totalStudents: studentsData.length,
      totalTeachers: teachersData.length,
      totalCourses: coursesData.length,
      activeCourses: coursesData.filter(course => course.status === "InProgress").length
    };
  } catch (error) {
    console.error("Dashboard stats fetch error:", error);
    throw error;
  }
};
