# 📌 Endpoint Listesi (Student Automation API)

## 🔑 AuthController
| Method | Endpoint           | Body Alanları                                                                 | Roller |
|--------|--------------------|-------------------------------------------------------------------------------|--------|
| POST   | /api/auth/register | FullName (zorunlu), Email (zorunlu), Password (zorunlu), Role (opsiyonel)    | Herkes (anonim) |
| POST   | /api/auth/login    | Email (zorunlu), Password (zorunlu)                                          | Herkes (anonim) |
| GET    | /api/auth/me       | -                                                                            | Authenticated (Admin, Teacher, Student) |

---

## 👨‍🎓 StudentController
| Method | Endpoint             | Body Alanları                              | Roller |
|--------|----------------------|---------------------------------------------|--------|
| GET    | /api/student         | -                                           | Admin, Teacher |
| GET    | /api/student/me      | -                                           | Student |
| GET    | /api/student/{id}    | -                                           | Admin, Teacher |
| PUT    | /api/student/{id}    | FullName (opsiyonel), Email (opsiyonel), Phone (opsiyonel) | Admin, Teacher |
| DELETE | /api/student/{id}    | -                                           | Admin |

---

## 👨‍🏫 TeacherController
| Method | Endpoint             | Body Alanları                                                                 | Roller |
|--------|----------------------|-------------------------------------------------------------------------------|--------|
| POST   | /api/teacher         | FullName (zorunlu), Email (zorunlu), Password (zorunlu), Phone (opsiyonel), Department (opsiyonel) | Admin |
| GET    | /api/teacher         | -                                                                             | Admin |
| GET    | /api/teacher/me      | -                                                                             | Teacher |
| GET    | /api/teacher/{id}    | -                                                                             | Admin, Teacher |
| PUT    | /api/teacher/{id}    | FullName (zorunlu), Email (opsiyonel), Phone (opsiyonel), Department (opsiyonel) | Admin |
| DELETE | /api/teacher/{id}    | -                                                                             | Admin |

---

## 📚 CourseController
| Method | Endpoint                           | Body Alanları                                 | Roller |
|--------|------------------------------------|------------------------------------------------|--------|
| POST   | /api/course                        | Title (zorunlu), Description (opsiyonel), TeacherId (zorunlu) | Admin |
| GET    | /api/course                        | -                                              | Admin |
| GET    | /api/course/my                     | -                                              | Teacher |
| GET    | /api/course/{id}                   | -                                              | Admin, Teacher |
| PATCH  | /api/course/{id}/status            | Status (zorunlu)                              | Teacher |
| POST   | /api/course/{id}/students/{sid}    | -                                              | Teacher |
| DELETE | /api/course/{id}/students/{sid}    | -                                              | Teacher |
| GET    | /api/course/{id}/students          | -                                              | Admin, Teacher |
| DELETE | /api/course/{id}                   | -                                              | Admin |

---

## 📝 CommentController
| Method | Endpoint                  | Body Alanları                                           | Roller |
|--------|---------------------------|--------------------------------------------------------|--------|
| POST   | /api/comment              | Content (zorunlu, min 5 max 1000), StudentId (zorunlu) | Teacher |
| PUT    | /api/comment/{id}         | Content (zorunlu, min 5 max 1000)                      | Teacher |
| DELETE | /api/comment/{id}         | -                                                      | Teacher |
| GET    | /api/comment/student/{id} | -                                                      | Admin, Teacher, Student (sadece kendi yorumlarını görebilir) |
| GET    | /api/comment/my           | -                                                      | Student |
| GET    | /api/comment/teacher/my   | -                                                      | Teacher |
| GET    | /api/comment/{id}         | -                                                      | Admin, Teacher |

---

## 📊 GradeController
| Method | Endpoint                  | Body Alanları                                      | Roller |
|--------|---------------------------|---------------------------------------------------|--------|
| POST   | /api/grade                | Score (zorunlu, 0-100), Description (opsiyonel), StudentId (zorunlu), CourseId (zorunlu) | Teacher |
| PUT    | /api/grade/{id}           | Score (zorunlu, 0-100), Description (opsiyonel)   | Teacher |
| DELETE | /api/grade/{id}           | -                                                 | Teacher |
| GET    | /api/grade/my             | -                                                 | Student |
| GET    | /api/grade/course/{cid}   | -                                                 | Teacher |
| GET    | /api/grade/{id}           | -                                                 | Admin, Teacher |

---

## 📅 AttendanceController
| Method | Endpoint                                | Body Alanları                                      | Roller |
|--------|-----------------------------------------|---------------------------------------------------|--------|
| POST   | /api/attendance/record                  | StudentId (zorunlu), CourseId (zorunlu), Status (zorunlu), Date (zorunlu), Notes (opsiyonel) | Teacher |
| PUT    | /api/attendance/{id}                    | Status (zorunlu), Notes (opsiyonel)               | Teacher |
| DELETE | /api/attendance/{id}                    | -                                                 | Teacher |
| GET    | /api/attendance/my                      | -                                                 | Student |
| GET    | /api/attendance/student/{sid}           | -                                                 | Admin, Teacher |
| GET    | /api/attendance/course/{cid}            | -                                                 | Teacher |
| GET    | /api/attendance/date/{date}             | -                                                 | Teacher |
| GET    | /api/attendance/student/{sid}/course/{cid} | -                                               | Admin, Teacher, Student (sadece kendi kaydını görebilir) |
| GET    | /api/attendance/{id}                    | -                                                 | Admin, Teacher |
