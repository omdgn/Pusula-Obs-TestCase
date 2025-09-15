# 🎓 Student Automation System

Modern, full-stack öğrenci yönetim sistemi. React frontend ve ASP.NET Core backend ile geliştirilmiş, JWT tabanlı kimlik doğrulama, rol bazlı yetkilendirme ve PostgreSQL veritabanı entegrasyonu içerir.

## 🚀 Live Demo

- **🌐 Frontend:** [https://pusula-obs-testcase.onrender.com/](https://pusula-obs-testcase.onrender.com/)
- **🔗 Backend API:** [https://pusula-obs-testcase-backend.onrender.com](https://pusula-obs-testcase-backend.onrender.com)
- **📚 API Documentation (Swagger):** [https://pusula-obs-testcase-backend.onrender.com/swagger](https://pusula-obs-testcase-backend.onrender.com/swagger)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama & Yetkilendirme
- JWT tabanlı güvenli oturum yönetimi
- Rol bazlı erişim kontrolü (Admin, Teacher, Student)
- BCrypt ile şifre hashleme
- Güvenli giriş/çıkış işlemleri

### 👥 Kullanıcı Yönetimi
- **Admin:** Öğretmen ve öğrenci oluşturma/düzenleme
- **Öğretmen:** Öğrenci bilgilerini görüntüleme ve yönetme
- **Öğrenci:** Kendi bilgilerini görüntüleme

### 📚 Ders Yönetimi
- Ders oluşturma ve düzenleme
- Öğrenci-ders ilişkisi yönetimi
- Ders durumu takibi (Başladı/Bitti)
- Öğretmen derslerini listeleme

### 📊 Not Sistemi
- Not ekleme ve güncelleme
- Öğrenci not geçmişi
- Ders bazlı not filtreleme
- Ortalama hesaplama

### 📅 Devamsızlık Takibi
- Yoklama kayıt sistemi
- Devamsızlık raporu
- Ders bazlı devamsızlık istatistikleri

### 💬 Yorum Sistemi
- Öğretmenden öğrenciye geri bildirim
- Öğrenci bazlı yorum geçmişi
- Yorum güncelleme ve silme

### 🎨 Modern UI/UX
- Responsive tasarım (Mobile-first)
- Dark/Light tema desteği
- Tailwind CSS ile modern arayüz
- Lucide React ikonları
- Interactive charts (Recharts)

## 🏗️ Teknoloji Stack

### Frontend
- **Framework:** React 19.1.1
- **Routing:** React Router DOM 7.8.2
- **Styling:** Tailwind CSS 4.1.13
- **HTTP Client:** Axios 1.11.0
- **Charts:** Recharts 3.2.0
- **Icons:** Lucide React 0.544.0
- **Notifications:** React Hot Toast 2.6.0
- **Build Tool:** Vite 7.1.2

### Backend
- **Framework:** ASP.NET Core 8.0
- **Database:** PostgreSQL
- **ORM:** Entity Framework Core 9.0.9
- **Authentication:** JWT Bearer Authentication
- **Password Hashing:** BCrypt.Net-Next 4.0.3
- **API Documentation:** Swagger/OpenAPI

### Infrastructure
- **Hosting:** Render.com
- **Database:** Render PostgreSQL
- **CI/CD:** GitHub integration
- **Containerization:** Docker

## 📂 Proje Yapısı

```
student-automation/
├── student-automation-frontend/     # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Page components
│   │   ├── context/               # React Context (Auth, Theme)
│   │   ├── services/              # API services
│   │   ├── layouts/               # Layout components
│   │   └── assets/                # Static assets
│   ├── public/                    # Public files
│   └── package.json
│
└── student-automation-backend/      # ASP.NET Core Backend
    ├── Controllers/               # API Controllers
    ├── Models/                    # Data models
    ├── Services/                  # Business logic
    ├── Data/                      # Database context
    ├── Helpers/                   # Utility classes
    ├── Migrations/                # EF Core migrations
    └── Program.cs                 # Application entry point
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kayıt
- `POST /api/auth/login` - Kullanıcı giriş

### User Management
- `GET /api/students` - Öğrenci listesi
- `POST /api/students` - Öğrenci oluştur
- `PUT /api/students/{id}` - Öğrenci güncelle
- `DELETE /api/students/{id}` - Öğrenci sil
- `GET /api/teachers` - Öğretmen listesi
- `POST /api/teachers` - Öğretmen oluştur

### Course Management
- `GET /api/courses` - Ders listesi
- `POST /api/courses` - Ders oluştur
- `GET /api/courses/my` - Öğretmenin dersleri
- `PATCH /api/courses/{id}/status` - Ders durumu güncelle

### Grades
- `POST /api/grades` - Not ekle
- `GET /api/grades/my` - Öğrenci notları
- `PUT /api/grades/{id}` - Not güncelle

### Attendance
- `POST /api/attendance/record` - Devamsızlık kaydet
- `GET /api/attendance/my` - Devamsızlık geçmişi

### Comments
- `POST /api/comments` - Yorum ekle
- `GET /api/comments/student/{id}` - Öğrenci yorumları

## 🔧 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- .NET 8.0 SDK
- PostgreSQL
- Git

### Backend Kurulum

```bash
# Repository clone
git clone https://github.com/omdgn/Pusula-Obs-TestCase.git
cd Pusula-Obs-TestCase/student-automation-backend

# Dependencies yükle
dotnet restore

# Database bağlantısını yapılandır (appsettings.json)
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=student_automation;Username=postgres;Password=yourpassword"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-here"
  }
}

# Migration uygula
dotnet ef database update

# Uygulamayı çalıştır
dotnet run
```

### Frontend Kurulum

```bash
cd ../student-automation-frontend

# Dependencies yükle
npm install

# Environment variables (.env)
VITE_API_BASE_URL=http://localhost:5055

# Development server başlat
npm run dev
```

## 🌐 Deploy

### Render.com Deploy

#### Backend Deploy
1. **New Web Service** oluştur
2. **Docker** seçeneğini seç
3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET_KEY=your-secret-key
   ASPNETCORE_ENVIRONMENT=Production
   ```

#### Frontend Deploy
1. **New Static Site** oluştur
2. **Build Command:** `npm ci && npm run build`
3. **Publish Directory:** `dist`

## 👥 Roller ve Yetkiler

### 🔴 Admin
- Tüm kullanıcıları yönetme
- Öğretmen ve öğrenci oluşturma
- Sistem geneli raporlama
- Tüm dersleri görüntüleme

### 🟡 Teacher (Öğretmen)
- Kendi derslerini yönetme
- Öğrenci not verme
- Devamsızlık kaydetme
- Öğrenci yorumlama
- Ders durumu güncelleme

### 🟢 Student (Öğrenci)
- Kendi notlarını görme
- Devamsızlık geçmişi
- Ders programı
- Yorumları okuma

## 🛡️ Güvenlik

- **JWT Authentication:** Güvenli token tabanlı kimlik doğrulama
- **Role-based Authorization:** Rol bazlı erişim kontrolü
- **Password Hashing:** BCrypt ile güvenli şifre saklama
- **CORS Policy:** Cross-origin resource sharing koruması
- **Input Validation:** Veri doğrulama ve sanitization

## 📊 Veritabanı Şeması

### Tablolar
- **Users:** Kullanıcı bilgileri (Admin, Teacher, Student)
- **Courses:** Ders bilgileri
- **CourseStudents:** Öğrenci-ders ilişkisi (Many-to-Many)
- **Grades:** Not kayıtları
- **Attendance:** Devamsızlık kayıtları
- **Comments:** Öğrenci yorumları

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun


## 📞 İletişim

- **GitHub:** [omdgn](https://github.com/omdgn)
- **Repository:** [Pusula-Obs-TestCase](https://github.com/omdgn/Pusula-Obs-TestCase)

## 📈 Özellik Roadmap

- [ ] Email bildirimleri
- [ ] Dosya yükleme sistemi
- [ ] SMS entegrasyonu
- [ ] Mobil uygulama
- [ ] Gelişmiş raporlama
- [ ] Çoklu dil desteği

---

**🎯 Bu proje, modern web teknolojileri kullanılarak geliştirilmiş kapsamlı bir öğrenci yönetim sistemidir.**