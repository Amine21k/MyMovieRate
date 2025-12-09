import { Navigate } from "react-router-dom";

export default function AdminRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || "").toString().toLowerCase();
  if (role !== "admin") {
    return <Navigate to="/films" replace />;
  }

  return children;
}
