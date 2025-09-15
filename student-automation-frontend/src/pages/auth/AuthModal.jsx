// src/components/AuthModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { login, register } from "../../services/authService";

export default function AuthModal({ mode = "login", onClose }) {
  const { isDark } = useTheme();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [formMode, setFormMode] = useState(mode);

  // form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted, mode:", formMode);
    console.log("Form data:", formData);

    try {
        if (formMode === "login") {
            console.log("Attempting login...");
        const res = await login({
            email: formData.email,
            password: formData.password,
        });

        // Backend direkt user objesini döndürüyor, res.user değil
        const userData = {
            id: res.id,
            email: res.email,
            fullName: res.fullName,
            role: res.role
        };

        // Context'e kullanıcı ve token bilgilerini kaydet
        authLogin(userData, res.token);
        console.log("Login success:", res);

        // Modal'ı kapat
        onClose();

        // Rol bazlı yönlendirme
        setTimeout(() => {
            if (res.role === "Student") {
                navigate("/student-dashboard");
            } else if (res.role === "Teacher") {
                navigate("/teacher-dashboard");
            } else if (res.role === "Admin") {
                navigate("/admin-dashboard");
            } else {
                // Rol bilgisi yoksa veya tanımlanmamışsa default Student olarak kabul et
                navigate("/student-dashboard");
            }
        }, 100);
        } else {
        const res = await register({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: "Student", // backend default zaten Student, garanti için gönderiyoruz
        });
        console.log("Register success:", res);

        // Register için de aynı yapı
        const userData = {
            id: res.id,
            email: res.email,
            fullName: res.fullName,
            role: res.role || "Student"
        };

        // Register sonrası direkt student dashboard'a yönlendir
        if (res.token) {
            authLogin(userData, res.token);
            onClose(); // modal kapat
            setTimeout(() => {
                navigate("/student-dashboard");
            }, 100);
        }
        }
    } catch (err) {
        console.error("Auth error:", err.response?.data || err.message);
    }
    };

  const inputClass = `w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  }`;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isDark ? "bg-black/60" : "bg-gray-900/50"
      }`}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-lg ${
          isDark
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {formMode === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad Soyad sadece kayıt olurken */}
            {formMode === "register" && (
              <div>
                <label className="block text-sm mb-1">Ad Soyad</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Adınızı girin"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="ornek@mail.com"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm mb-1">Şifre</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="••••••"
              />
            </div>

            {/* Şifre Tekrar - sadece register modunda */}
            {formMode === "register" && (
              <div>
                <label className="block text-sm mb-1">Şifre Tekrar</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="••••••"
                />
              </div>
            )}

            {/* Şifreyi göster kutucuğu */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="h-4 w-4"
              />
              <label htmlFor="showPassword" className="text-sm">
                Şifreyi göster
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 font-medium shadow hover:opacity-90"
            >
              {formMode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          {/* Alt Link */}
          <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
            {formMode === "login" ? (
              <>
                Hesabın yok mu?{" "}
                <button
                  onClick={() => setFormMode("register")}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Kayıt Ol
                </button>
              </>
            ) : (
              <>
                Zaten üye misin?{" "}
                <button
                  onClick={() => setFormMode("login")}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Giriş Yap
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
