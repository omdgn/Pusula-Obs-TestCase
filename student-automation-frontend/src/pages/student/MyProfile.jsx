// src/pages/student/MyProfile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/FormInput";
import { getMyProfile, updateMyProfile, getMyCourses, getMyGrades, getMyAttendance } from "../../services/studentService";
import { User, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react";

export default function MyProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [statistics, setStatistics] = useState({
    activeCourses: 0,
    averageGrade: 0,
    attendanceRate: 0
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profile, courses, grades, attendance] = await Promise.all([
          getMyProfile(),
          getMyCourses(),
          getMyGrades(),
          getMyAttendance()
        ]);

        setProfileData(profile);
        setFormData({
          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || ""
        });

        // Calculate statistics
        const activeCourses = courses.filter(c => c.status === "InProgress").length;
        const averageGrade = grades.length > 0
          ? Math.round(grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length)
          : 0;
        const attendanceRate = attendance.length > 0
          ? Math.round((attendance.filter(a => a.status === "Present").length / attendance.length) * 100)
          : 0;

        setStatistics({
          activeCourses,
          averageGrade,
          attendanceRate
        });
      } catch (err) {
        console.error("Profile data fetch error:", err);

        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Profil bilgileri yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await updateMyProfile(formData);
      setProfileData(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.status === 403) {
        setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
      } else if (error.response?.status === 401) {
        setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
      } else {
        setError("Profil güncellenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
      }
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phone || ""
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Yeniden Dene
          </button>
          {(error.includes("Yetki hatası") || error.includes("Oturum süresi")) && (
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-600">
                Profilim
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Kişisel bilgilerini görüntüle ve düzenle
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <X className="w-4 h-4" />
                    İptal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <User className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                {profileData?.fullName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Öğrenci
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {profileData?.id}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Ad Soyad"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing}
              icon={{ type: User }}
              required
            />

            <FormInput
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              icon={{ type: Mail }}
              required
            />

            <FormInput
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              icon={{ type: Phone }}
              placeholder="0555 123 45 67"
            />

            <FormInput
              label="Kayıt Tarihi"
              name="createdAt"
              type="date"
              value={profileData?.createdAt ? new Date(profileData.createdAt).toISOString().split('T')[0] : ''}
              disabled={true}
              icon={{ type: Calendar }}
            />
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600 mb-4">
              Akademik Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Ders Sayısı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">{statistics.activeCourses}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Genel Ortalama</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.averageGrade}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Devam Oranı</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}