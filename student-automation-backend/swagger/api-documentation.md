# Student Automation API Documentation

## 🎯 Overview

The Student Automation API provides comprehensive endpoints for managing a student information system. The API supports authentication, user management, course management, grading, comments, and attendance tracking.

## 🔐 Authentication

All protected endpoints require JWT Bearer token authentication:
```
Authorization: Bearer {your_jwt_token}
```

### Roles
- **Admin**: Full system access, can manage teachers and students
- **Teacher**: Can manage courses, grades, comments, and attendance for their assigned courses
- **Student**: Limited access to their own data (grades, comments, attendance)

## 📋 API Endpoints Overview

### 🔑 Authentication (`/api/auth`)
- `POST /register` - Register new user (Admin role only in current implementation)
- `POST /login` - User login (returns JWT token)
- `GET /me` - Get current user profile

### 👨‍🎓 Student Management (`/api/student`)
- `GET /` - Get all students (Admin, Teacher)
- `GET /me` - Get own profile (Student)
- `GET /{id}` - Get student by ID (Admin, Teacher)
- `PUT /{id}` - Update student (Admin, Teacher)
- `DELETE /{id}` - Delete student (Admin)

### 👨‍🏫 Teacher Management (`/api/teacher`)
- `POST /` - Create teacher (Admin)
- `GET /` - Get all teachers (Admin)
- `GET /me` - Get own profile (Teacher)
- `GET /{id}` - Get teacher by ID (Admin, Teacher)
- `PUT /{id}` - Update teacher (Admin)
- `DELETE /{id}` - Delete teacher (Admin)

### 📚 Course Management (`/api/course`)
- `POST /` - Create course (Admin)
- `GET /my` - Get teacher's courses (Teacher)
- `GET /{id}` - Get course details (Admin, Teacher)
- `PATCH /{id}/status` - Update course status (Teacher)
- `POST /{id}/students/{studentId}` - Add student to course (Teacher)
- `DELETE /{id}/students/{studentId}` - Remove student from course (Teacher)

### 📊 Grade Management (`/api/grade`)
- `POST /` - Add grade (Teacher)
- `PUT /{id}` - Update grade (Teacher)
- `DELETE /{id}` - Delete grade (Teacher)
- `GET /my` - Get student's grades (Student)
- `GET /course/{courseId}` - Get grades for course (Teacher)
- `GET /{id}` - Get grade by ID (Teacher, Admin)

### 💬 Comment Management (`/api/comment`)
- `POST /` - Add comment about student (Teacher)
- `PUT /{id}` - Update comment (Teacher)
- `DELETE /{id}` - Delete comment (Teacher)
- `GET /my` - Get student's comments (Student)
- `GET /student/{studentId}` - Get student comments (Teacher, Admin, Student-own)
- `GET /teacher/my` - Get teacher's comments (Teacher)
- `GET /{id}` - Get comment by ID (Teacher, Admin)

### 📅 Attendance Management (`/api/attendance`)
- `POST /record` - Record attendance (Teacher)
- `PUT /{id}` - Update attendance (Teacher)
- `DELETE /{id}` - Delete attendance record (Teacher)
- `GET /my` - Get student's attendance (Student)
- `GET /student/{studentId}` - Get student attendance (Teacher, Admin)
- `GET /course/{courseId}` - Get course attendance (Teacher)
- `GET /date/{date}` - Get attendance by date (Teacher)
- `GET /student/{studentId}/course/{courseId}` - Get attendance for student-course (All with restrictions)
- `GET /{id}` - Get attendance by ID (Teacher, Admin)

## 🎯 Data Models

### User Roles
```json
{
  "Admin": 0,
  "Teacher": 1,
  "Student": 2
}
```

### Attendance Status
```json
{
  "Present": 0,
  "Absent": 1,
  "Late": 2,
  "Excused": 3
}
```

## 📝 Example Requests

### Login
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Record Attendance
```bash
POST /api/attendance/record
Authorization: Bearer {teacher_token}
{
  "studentId": "12345678-1234-1234-1234-123456789012",
  "courseId": "87654321-4321-4321-4321-210987654321",
  "status": 1,
  "date": "2025-01-15T09:00:00Z",
  "notes": "Student was absent"
}
```

### Add Grade
```bash
POST /api/grade
Authorization: Bearer {teacher_token}
{
  "score": 85.5,
  "description": "Midterm Exam",
  "studentId": "12345678-1234-1234-1234-123456789012",
  "courseId": "87654321-4321-4321-4321-210987654321"
}
```

## ⚠️ Important Notes

1. **GUID Format**: All IDs use standard GUID format (e.g., `12345678-1234-1234-1234-123456789012`)
2. **DateTime Format**: Use ISO 8601 format (`2025-01-15T09:00:00Z`)
3. **Validation**: All inputs are validated according to their data annotations
4. **Authorization**: Endpoints enforce role-based access control
5. **Error Handling**: API returns appropriate HTTP status codes with error messages

## 🚀 Getting Started

1. **Register/Login**: Start with authentication to get JWT token
2. **Create Teacher**: Use Admin account to create teacher accounts
3. **Create Courses**: Use Admin account to create courses
4. **Assign Students**: Teachers can add students to their courses
5. **Manage Data**: Use appropriate endpoints based on your role

For detailed endpoint documentation with interactive examples, visit the Swagger UI at `/swagger` when running the application.