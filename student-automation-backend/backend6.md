# 📌 Student Automation - Eksik Gereksinim Geliştirme Planı

Bu doküman, tamamlanmamış tüm proje gereksinimlerinin geliştirme planını modüllere göre sunar.

---

## ✅ 1. Teacher Create Endpoint

### 🎯 Gereksinim
- Admin, yeni öğretmen oluşturabilmeli.

### 🛠️ Yapılacaklar
- [x] `POST /api/teacher`
- [x] `CreateTeacherDto.cs` oluştur
- [x] `IUserService.CreateTeacherAsync(CreateTeacherDto dto)`

---

## ✅ 2. Course (Ders) Yönetimi Modülü

### 🎯 Gereksinimler
- [x] Admin ders oluşturabilmeli.
- [x] Öğretmen derslerini listeleyebilmeli.
- [x] Öğretmen ders durumu (başladı/bitti) güncelleyebilmeli.
- [x] Öğretmen derse öğrenci ekleyip çıkarabilmeli.

### 🛠️ Yapılacaklar
- [x] `Course` modeli
- [x] `CourseStudent` join tablosu (many-to-many)
- [x] `CourseController.cs`
- [x] `CreateCourseDto`, `UpdateCourseStatusDto`
- [x] `ICourseService`, `CourseService.cs`

### 📡 Endpoint Örnekleri
- `[POST] /api/course`
- `[GET] /api/course/my`
- `[PATCH] /api/course/{id}/status`
- `[POST] /api/course/{id}/students/{studentId}`
- `[DELETE] /api/course/{id}/students/{studentId}`
- ...

---

## ✅ 3. Comment (Yorum) Modülü

### 🎯 Gereksinim
- Öğretmen, öğrencisini yorumlayabilmeli.

### 🛠️ Yapılacaklar
- [ ] `Comment` modeli
- [ ] `CommentController.cs`
- [ ] `AddCommentDto`

### 📡 Endpoint Örnekleri
- `[POST] /api/comments`
- `[GET] /api/comments/student/{id}`
- ...

---

## ✅ 4. Grade (Not) Modülü

### 🎯 Gereksinimler
- Öğretmen not verebilmeli.
- Öğrenci notlarını görebilmeli.

### 🛠️ Yapılacaklar
- [x] `Grade` modeli
- [x] `GradeController.cs`
- [x] `AddGradeDto`, `UpdateGradeDto`
- [x] `IGradeService`, `GradeService.cs`

### 📡 Endpoint Örnekleri
- `[POST] /api/grades`
- `[GET] /api/grades/my`
- `[GET] /api/grades/course/{id}`
- ...

---

## ✅ 5. Attendance (Devamsızlık) Modülü

### 🎯 Gereksinimler
- Öğretmen devamsızlık girişi yapabilmeli.
- Öğrenci devamsızlık geçmişini görebilmeli.

### 🛠️ Yapılacaklar
- [ ] `Attendance` modeli
- [ ] `AttendanceController.cs`
- [ ] `RecordAttendanceDto`, `StudentAttendanceDto`

### 📡 Endpoint Örnekleri
- `[POST] /api/attendance/record`
- `[GET] /api/attendance/my`
- ...

---

## 🧩 Geliştirme Sıralaması (Önerilen)

| Aşama | Modül              | Tahmini Süre | Öncelik |
|-------|---------------------|--------------|---------|
| 1     | Teacher Create       | 0.5 gün      | 🔥 Yüksek |
| 2     | Course Management    | 1-2 gün      | 🔥 Yüksek |
| 3     | Grade System         | 1 gün        | 🔥 Yüksek |
| 4     | Attendance System    | 1 gün        | 🟡 Orta |
| 5     | Comment System       | 0.5 gün      | 🟢 Düşük |

---

## 📎 Ekstra
- [ ] Swagger yorumları ve OpenAPI açıklamaları eklenecek
- [ ] DTO’larda `DataAnnotations` ile validation sağlanacak
- [ ] Tüm endpoint’lerde JWT + Role-based auth kontrolü olacak

---


