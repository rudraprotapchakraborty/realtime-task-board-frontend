import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { safeRedirectPath } from "../lib/redirect";

const Spinner = () => (
  <div className="grid min-h-[60vh] place-items-center" role="status">
    <Loader2 className="h-8 w-8 animate-spin text-brand" aria-label="Loading" />
  </div>
);

/** Signed-in pages. Visitors are sent to the login page and brought back afterwards. */
export function Protected({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) {
    const from = location.pathname + location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }
  if (role && user.role !== role) return <Navigate to="/board" replace />;
  return children;
}

/**
 * Pages that only make sense when signed out (login, register, reset password,
 * verify email). A signed-in visitor is sent on instead of seeing the form.
 */
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (user) {
    const from = new URLSearchParams(location.search).get("from");
    return <Navigate to={safeRedirectPath(from, "/board")} replace />;
  }
  return children;
}
