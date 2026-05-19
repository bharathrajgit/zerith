  import React from "react";
  import { Navigate, useLocation } from "react-router-dom";
  import { useAuth } from "../../context/AuthContext";

  // Full-page loader shown while auth state is initializing
  const FullPageLoader = () => (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem",
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "3px solid #1e1e35",
        borderTopColor: "#6366f1",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#64748b", fontSize: "0.875rem", fontFamily: "Inter, sans-serif" }}>
        Loading...
      </p>
    </div>
  );

const ProtectedRoute = ({ children, requiredType }) => {
  const { isLoading, isAuthenticated, userType, user } = useAuth();
  const location = useLocation();
  const storedDiagnosticCompleted =
    requiredType === "student" && localStorage.getItem("dsa_diag_completed") === "true";

  // 1. Still loading auth state
  if (isLoading) return <FullPageLoader />;

    // 2. Not authenticated at all
    if (!isAuthenticated) {
      const loginPath =
        requiredType === "institution" ? "/institution/login" : "/login";
      return <Navigate to={loginPath} replace />;
    }

    // 3. Wrong user type — student trying institution route
    if (requiredType === "student" && userType !== "student") {
      return <Navigate to="/login" replace />;
    }

  // 4. Wrong user type — institution trying student route
  if (requiredType === "institution" && userType !== "institution") {
    return <Navigate to="/institution/login" replace />;
  }

  // 5. Student must complete diagnostic first
  if (
    requiredType === "student" &&
    user?.diagnosticCompleted === false &&
    !storedDiagnosticCompleted &&
    location.pathname !== "/diagnostic"
  ) {
    return <Navigate to="/diagnostic" replace />;
  }

  // 6. All checks passed
  return children;
};

export default ProtectedRoute;
