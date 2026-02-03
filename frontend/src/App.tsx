import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/useAuth';
import { KioskApp } from './KioskApp';
import { AdminLogin } from './features/admin/AdminLogin';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { ItemManager } from './features/admin/ItemManager';
import { OrderManager } from './features/admin/OrderManager';
import { AdminLayout } from './features/admin/AdminLayout';
import { RequireAuth } from './features/auth/RequireAuth';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<KioskApp />} />

          {/* Admin Routes wrapped in Layout */}
          <Route path="/admin" element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="items" element={<ItemManager />} />
            <Route path="orders" element={<OrderManager />} />
          </Route>

          {/* Login separate from layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
