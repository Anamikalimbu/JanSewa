/**
 * context/AuthContext.jsx
 *
 * Provides authentication state (user, token, login, logout)
 * across the entire app via React Context.
 *
 */

import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    const { user: loggedInUser, token: authToken } = data.data || data;
    setUser(loggedInUser);
    setToken(authToken);
    if (authToken) localStorage.setItem("token", authToken);
    return loggedInUser;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const { user: newUser, token: authToken } = data.data || data;
    setUser(newUser);
    setToken(authToken);
    if (authToken) localStorage.setItem("token", authToken);
    return newUser;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
