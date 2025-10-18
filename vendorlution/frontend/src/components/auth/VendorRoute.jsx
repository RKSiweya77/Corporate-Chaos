// src/components/auth/VendorRoute.jsx
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

export default function VendorRoute({ children }) {
  return (
    <ProtectedRoute requireRole="vendor">
      {children}
    </ProtectedRoute>
  );
}