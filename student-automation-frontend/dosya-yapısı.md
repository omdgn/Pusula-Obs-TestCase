src/

│
├── App.jsx                # Uygulamanın giriş noktası, Router & Provider (Context) burada çalışır.
├── index.css              # Tailwind'in global stilleri, tüm proje için ortak stiller.
│
├── assets/                # Logo, ikon, görseller gibi statik dosyalar.
│
├── components/            # Tekrar kullanılabilir küçük UI parçaları (atomic yapı)
│   ├── Navbar.jsx         # Üst navigasyon çubuğu (rol farketmeden her layout’ta kullanılabilir).
│   ├── Sidebar.jsx        # Sol menü (role göre dinamik linkler gelir).
│   ├── ProtectedRoute.jsx # Route’ları JWT + role bazlı korumak için özel component.
│   ├── Table.jsx          # Listeleme, tablo gösterimi için ortak component.
│   ├── FormInput.jsx      # Tekrar kullanılabilir input (label + error + style).
│   └── Chart.jsx          # Grafikler (not ortalaması, devamsızlık grafiği vb.) için.
│
├── context/               # Context API ile global state yönetimi
│   ├── AuthContext.jsx    # Kullanıcı auth bilgisi (token, kullanıcı rolü) yönetimi.
│   └── ThemeContext.jsx   # Dark / Light tema yönetimi.
│
├── services/              # API çağrıları (axiosInstance ile backend iletişimi)
│   ├── authService.js     # Login, register, token yenileme vb. auth işlemleri.
│   ├── studentService.js  # Öğrenciler ile ilgili CRUD ve özel işlemler.
│   ├── teacherService.js  # Öğretmen CRUD ve işlemleri.
│   ├── adminService.js    # Admin CRUD ve işlemleri.
│
├── layouts/               # Rol bazlı ana sayfa düzenleri (sidebar + navbar + içerik)
│   ├── AdminLayout.jsx    # Admin için genel layout (sidebar + header + içerik).
│   ├── TeacherLayout.jsx  # Teacher için genel layout.
│   └── StudentLayout.jsx  # Student için genel layout.
│
├── pages/                 # Sayfa bazlı componentler
│   ├── auth/              # Auth ekranları
│   │   ├── Login.jsx      # Giriş ekranı
│   │   └── Register.jsx   # Kayıt ekranı
│   │
│   ├── dashboard/         # Ortak + rol bazlı dashboard ekranları
│   │   └── Dashboard.jsx          # Ortak landing page (rol kontrolü yapılır)
│   │   └── AdminDashboard.jsx     # Admin ana dashboard
│   │   └── TeacherDashboard.jsx   # Teacher ana dashboard
│   │   └── StudentDashboard.jsx   # Student ana dashboard
│   │
│   ├── admin/             # Admin rolüne özel sayfalar
│   │   ├── Students.jsx       # Öğrencileri listeleme/güncelleme
│   │   ├── StudentDetail.jsx  # Öğrenci detay sayfası
│   │   ├── Teachers.jsx       # Öğretmen listeleme/güncelleme
│   │   ├── TeacherDetail.jsx  # Öğretmen detay sayfası
│   │   └── Courses.jsx        # Ders yönetimi sayfası
│   │
│   ├── teacher/           # Teacher rolüne özel sayfalar
│   │   ├── MyCourses.jsx      # Kendi derslerini listele
│   │   ├── CourseDetail.jsx   # Ders detay (öğrenci ekleme, yoklama)
│   │   ├── Students.jsx       # Dersi alan öğrenciler
│   │   ├── Attendance.jsx     # Yoklama ekranı
│   │   ├── Grades.jsx         # Not giriş ekranı
│   │   └── Comments.jsx       # Yorumlar (öğretmen -> öğrenci)
│   │
│   ├── student/           # Student rolüne özel sayfalar
│   │   ├── MyProfile.jsx      # Öğrenci profil bilgileri
│   │   ├── MyCourses.jsx      # Öğrencinin kayıtlı dersleri
│   │   ├── MyGrades.jsx       # Notlarını gör
│   │   └── MyAttendance.jsx   # Yoklama durumunu gör
│   │
│   └── shared/            # Ortak sayfalar
│       ├── Profile.jsx        # Profil sayfası (rol farketmez)
│       └── NotFound.jsx       # 404 sayfası
│
└── utils/                 # Yardımcı fonksiyonlar
    ├── axiosInstance.js   # axios ile base url + interceptors ayarı
    ├── formatDate.js      # Tarih formatlama helper
    └── roleUtils.js       # Rol bazlı yönlendirme / izin kontrolü




