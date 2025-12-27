import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { AuthLayout } from '../components/layouts';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../stores/authStore';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const { login, isLoading, error, clearError, user } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/dashboard' : '/user-home');
    }
  }, [user, navigate]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) clearError();
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    const success = await login({ username, password });
    
    if (success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/tool-intro');
      }
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay trở lại"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <Input
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={<UserOutlined />}
          autoComplete="username"
          disabled={isLoading}
        />

        <div className="relative">
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockOutlined />}
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          className="w-full mt-6"
        >
          Đăng nhập
        </Button>

        <div className="text-center pt-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>


      </form>
    </AuthLayout>
  );
};

export default LoginPage;



