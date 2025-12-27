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
import { ProtectedRoute, LoadingScreen } from './components/layouts';

// Auth Route - Redirect if already logged in
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuthStore();

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/user-home'} replace />;
  }

  return <>{children}</>;
};

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
