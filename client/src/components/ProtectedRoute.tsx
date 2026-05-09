import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const { token } = useAuthStore();

  // Strictly physically verify JWT exists, else forcibly redirect
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Return nested explicit routing pipeline if token clears physical memory mapping
  return <Outlet />;
}
