import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bookwise_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setProvider(res.data))
      .catch(() => {
        localStorage.removeItem("bookwise_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // Called after verify-otp succeeds — this is the ONLY place a token gets stored
  const completeLogin = (data) => {
    localStorage.setItem("bookwise_token", data.token);
    setProvider({
      _id: data._id,
      name: data.name,
      email: data.email,
      slug: data.slug,
      plan: data.plan,
    });
  };

  const logout = () => {
    localStorage.removeItem("bookwise_token");
    setProvider(null);
  };

  return (
    <AuthContext.Provider value={{ provider, loading, completeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);