/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: null,
    userType: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("dsa_token");
    let userType = localStorage.getItem("dsa_user_type");

    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      let userData = null;
      let resolvedType = userType;

      const fetchStudent = async () => {
        const res = await api.get("/auth/me");
        return res.data.data?.user || res.data.user || res.data;
      };
      const fetchInstitution = async () => {
        const res = await api.get("/institution/auth/profile");
        return res.data.data?.institution || res.data.institution || res.data;
      };

      if (userType === "student") {
        userData = await fetchStudent();
      } else if (userType === "institution") {
        userData = await fetchInstitution();
      } else {
        try {
          userData = await fetchStudent();
          resolvedType = "student";
        } catch {
          userData = await fetchInstitution();
          resolvedType = "institution";
        }
      }

      if (!userData) throw new Error("Failed to restore session");
      localStorage.setItem("dsa_user_type", resolvedType);
      setState({
        user: userData,
        token,
        userType: resolvedType,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem("dsa_token");
      localStorage.removeItem("dsa_user_type");
      setState({ user: null, token: null, userType: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();
  }, [loadUser]);

  const loginStudent = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token } = res.data;
    const user = res.data.data?.user || res.data.user;
    const mustResetPassword = res.data.data?.mustResetPassword || res.data.mustResetPassword;
    localStorage.setItem("dsa_token", token);
    localStorage.setItem("dsa_user_type", "student");
    setState({ user, token, userType: "student", isLoading: false, isAuthenticated: true });
    return { success: true, mustReset: mustResetPassword || user?.mustResetPassword };
  };

  const loginInstitution = async (email, password) => {
    const res = await api.post("/institution/auth/login", { email, password });
    const { token } = res.data;
    const institution = res.data.data?.institution || res.data.institution;
    localStorage.setItem("dsa_token", token);
    localStorage.setItem("dsa_user_type", "institution");
    setState({ user: institution, token, userType: "institution", isLoading: false, isAuthenticated: true });
    return { success: true };
  };

  const registerStudent = async (formData) => {
    const res = await api.post("/auth/register", formData);
    const { token } = res.data;
    const user = res.data.data?.user || res.data.user;
    const mustResetPassword = res.data.data?.mustResetPassword || user?.mustResetPassword;
    localStorage.setItem("dsa_token", token);
    localStorage.setItem("dsa_user_type", "student");
    setState({ user, token, userType: "student", isLoading: false, isAuthenticated: true });
    return { success: true, user, mustReset: mustResetPassword || user?.mustResetPassword };
  };

  const registerInstitution = async (formData) => {
    const res = await api.post("/institution/auth/register", formData);
    const { token } = res.data;
    const institution = res.data.data?.institution || res.data.institution;
    localStorage.setItem("dsa_token", token);
    localStorage.setItem("dsa_user_type", "institution");
    setState({ user: institution, token, userType: "institution", isLoading: false, isAuthenticated: true });
    return { success: true, institutionCode: institution?.institutionCode };
  };

  const logout = () => {
    localStorage.removeItem("dsa_token");
    localStorage.removeItem("dsa_user_type");
    setState({ user: null, token: null, userType: null, isLoading: false, isAuthenticated: false });
    navigate("/");
  };

  const updateUser = (updates) => {
    setState((prev) => ({ ...prev, user: { ...prev.user, ...updates } }));
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      if (res.data.success) {
        setState((prev) => ({ ...prev, user: res.data.data.user }));
        return { success: true, user: res.data.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  };

  const resetFirstPassword = async (payload) => {
    const res = await api.put('/auth/reset-first-password', payload);
    const { token } = res.data;
    const user = res.data.data?.user || res.data.user;

    if (token) {
      localStorage.setItem('dsa_token', token);
    }
    localStorage.setItem('dsa_user_type', 'student');

    setState((prev) => ({
      ...prev,
      user,
      token: token || prev.token,
      userType: 'student',
      isLoading: false,
      isAuthenticated: true,
    }));

    return {
      success: true,
      user,
      nextPath: user?.diagnosticCompleted ? '/roadmap' : '/diagnostic',
    };
  };

  return (
    <AuthContext.Provider value={{ ...state, loginStudent, loginInstitution, registerStudent, registerInstitution, resetFirstPassword, logout, updateUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
