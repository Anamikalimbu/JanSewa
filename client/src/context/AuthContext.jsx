/**
 * context/AuthContext.jsx
 *
 * Provides authentication state (user, token, login, logout)
 * across the entire app via React Context.
 *
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  // true while we check for an existing session on first load
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already stored, fetch the profile it
  // belongs to so a page refresh doesn't silently log the user out.
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data?.user || null);
      } catch (err) {
        // token invalid/expired — clear it out
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const resetPassword = async (resetToken, password) => {
    const { data } = await api.post(`/auth/reset-password/${resetToken}`, { password });
    const { user: updatedUser, token: authToken } = data.data || data;
    setUser(updatedUser);
    setToken(authToken);
    if (authToken) localStorage.setItem("token", authToken);
    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // Lets a logged-in user change their own password from a Settings page.
  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.patch("/auth/change-password", { currentPassword, newPassword });
    return data;
  };

  // Updates the cached user object in-place (e.g. after a profile edit)
  // so the navbar/sidebar reflect the change without a full re-login.
  const updateUser = (fields) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, forgotPassword, resetPassword, changePassword, updateUser, logout }}
    >
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
