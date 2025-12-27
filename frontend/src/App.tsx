import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import {
  LoginPage,
  RegisterPage,
  UserHomePage,
  DashboardPage,
  ComputersPage,
  UsersPage,
  WarehousesPage,
} from './pages';
import { useAuthStore } from './stores/authStore';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/user-home" replace />;
  }

  return <>{children}</>;
};

// Auth Route - Redirect if already logged in
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuthStore();

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/user-home'} replace />;
  }

  return <>{children}</>;
};

// Loading Screen
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="spinner mx-auto mb-4" />
      <p className="text-slate-400">Đang tải...</p>
    </div>
  </div>
);

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user-home"
        element={
          <ProtectedRoute>
            <UserHomePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/computers"
        element={
          <ProtectedRoute requireAdmin>
            <ComputersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute requireAdmin>
            <WarehousesPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  const [isChecking, setIsChecking] = useState(true);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    init();
  }, [checkAuth]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 12,
        },
      }}
    >
      <AntApp>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
