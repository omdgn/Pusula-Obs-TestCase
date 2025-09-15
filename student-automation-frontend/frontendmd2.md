# ✅ Nihai Role Bazlı Dashboard Planı

## 1. Ortak Yapı
- [ ] **App.jsx** → Router + ReactDOM + Context Provider
- [ ] **index.css** → Tailwind stilleri
- [ ] **axiosInstance.js** → BaseURL + JWT interceptor
- [ ] **AuthContext** → Login/Register/Me state yönetimi
- [ ] **ThemeContext** → Dark/Light mode
- [ ] **ProtectedRoute.jsx** → Rol bazlı erişim kontrolü
- [ ] **Ortak Componentler**: Navbar, Sidebar, Table, FormInput, Chart, ProfileCard
- [ ] **Ortak Sayfalar**: Login.jsx, Register.jsx, NotFound.jsx

---

## 2. StudentDashboard.jsx (👨‍🎓)
### Endpointler
- GET `/api/auth/me`
- GET `/api/student/me`
- GET `/api/course/my`
- GET `/api/grade/my`
- GET `/api/attendance/my`
- GET `/api/comment/my`
- GET `/api/comment/student/{id}`

### Dashboard Bölümleri
- **Profilim** → ProfileCard  
- **Derslerim** → CourseList  
- **Notlarım** → GradeTable + GradeChart  
- **Devamsızlık** → AttendanceTable  
- **Yorumlar** → CommentList  

---

## 3. TeacherDashboard.jsx (👨‍🏫)
### Endpointler
- GET `/api/auth/me`
- GET `/api/teacher/me`
- GET `/api/course/my`
- GET `/api/course/{id}/students`
- PATCH `/api/course/{id}/status`
- POST `/api/course/{id}/students/{sid}`
- DELETE `/api/course/{id}/students/{sid}`
- POST `/api/grade`
- PUT `/api/grade/{id}`
- DELETE `/api/grade/{id}`
- GET `/api/grade/course/{cid}`
- POST `/api/attendance/record`
- PUT `/api/attendance/{id}`
- DELETE `/api/attendance/{id}`
- GET `/api/attendance/course/{cid}`
- POST `/api/comment`
- PUT `/api/comment/{id}`
- DELETE `/api/comment/{id}`
- GET `/api/comment/teacher/my`

### Dashboard Bölümleri
- **Derslerim** → CourseTable  
- **Ders Detayı** → CourseDetail + StudentTable  
- **Not Yönetimi** → GradeForm + GradeTable  
- **Devamsızlık Yönetimi** → AttendanceForm + AttendanceTable  
- **Yorumlarım** → CommentForm + CommentList  

---

## 4. AdminDashboard.jsx (🛡️)
### Endpointler
- GET `/api/student`
- GET `/api/student/{id}`
- PUT `/api/student/{id}`
- DELETE `/api/student/{id}`
- GET `/api/teacher`
- GET `/api/teacher/{id}`
- POST `/api/teacher`
- PUT `/api/teacher/{id}`
- DELETE `/api/teacher/{id}`
- GET `/api/course`
- GET `/api/course/{id}`
- POST `/api/course`
- DELETE `/api/course/{id}`

### Dashboard Bölümleri
- **Öğrenciler** → Table + DetailCard + FormModal  
- **Öğretmenler** → Table + DetailCard + FormModal  
- **Dersler** → Table + DetailCard + FormModal  

---

## 5. Bonus Özellikler (PDF Gereksinimleri):contentReference[oaicite:0]{index=0}
- [ ] **Dark Mode** → ThemeContext üzerinden
- [ ] **Grafikler** → Not ortalaması için Chart.js / Recharts
- [ ] **CSV/PDF Export** → Öğrenci ve not listeleri
- [ ] **Bildirim Sistemi** → Not/attendance eklendiğinde öğrenciye alert
- [ ] **Responsive Tasarım** → Tailwind
- [ ] **Arama & Filtreleme** → Öğrenci/öğretmen/ders listelerinde
- [ ] **Kod Kalite Analizi** → SonarCloud vb.

---

## 6. Router Haritası
- `/login` → Login.jsx  
- `/register` → Register.jsx  
- `/student-dashboard` → StudentDashboard.jsx  
- `/teacher-dashboard` → TeacherDashboard.jsx  
- `/admin-dashboard` → AdminDashboard.jsx  
- `*` → NotFound.jsx
