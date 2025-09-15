import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // 🔑 ekledik

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedUser !== "undefined" && storedToken && storedToken !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.role) parsedUser.role = "Student"; // fallback
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("localStorage parse error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false); // 🔑 veriler yüklendi
  }, []);

  const login = (userData, jwtToken) => {
    const safeUser = { ...userData, role: userData.role || "Student" };
    setUser(safeUser);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(safeUser));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
