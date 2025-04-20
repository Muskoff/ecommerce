import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';

// Import admin pages
import Dashboard from '../pages/admin/Dashboard';
import Products from '../pages/admin/Products';
import Orders from '../pages/admin/Orders';
import Users from '../pages/admin/Users';
import Categories from '../pages/admin/Categories';
import Settings from '../pages/admin/Settings';

// Protected Route component
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoutes = () => {
  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};

export default AdminRoutes; 