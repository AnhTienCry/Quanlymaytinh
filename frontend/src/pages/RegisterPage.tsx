import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { AuthLayout } from '../components/layouts';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../stores/authStore';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const { register, isLoading, error, clearError, user } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/dashboard' : '/tool-intro');
    }
  }, [user, navigate]);

  // Clear errors when inputs change
  useEffect(() => {
    if (error) clearError();
    if (localError) setLocalError('');
  }, [username, password, confirmPassword]);

  // Password requirements check
  const passwordChecks = {
    length: password.length >= 6,
    hasNumber: /\d/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setLocalError('Vui lòng nhập tên đăng nhập');
      return;
    }

    if (!passwordChecks.length) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!passwordChecks.match) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }

    const success = await register({ username, password });

    if (success) {
      navigate('/tool-intro');
    }
  };

  const displayError = localError || error;

  return (
    <AuthLayout title="Đăng ký" subtitle="Tạo tài khoản mới">
      <form onSubmit={handleSubmit} className="space-y-5">
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {displayError}
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
            autoComplete="new-password"
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

        <Input
          label="Xác nhận mật khẩu"
          type={showPassword ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<LockOutlined />}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Password requirements */}
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <PasswordCheck passed={passwordChecks.length} label="Ít nhất 6 ký tự" />
            <PasswordCheck passed={passwordChecks.match} label="Mật khẩu khớp" />
          </motion.div>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          className="w-full mt-6"
        >
          Đăng ký
        </Button>

        <div className="text-center pt-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

// Password check component
const PasswordCheck: React.FC<{ passed: boolean; label: string }> = ({
  passed,
  label,
}) => (
  <div className="flex items-center gap-2 text-sm">
    <CheckCircleOutlined
      className={passed ? 'text-green-400' : 'text-slate-500'}
    />
    <span className={passed ? 'text-green-400' : 'text-slate-400'}>{label}</span>
  </div>
);

export default RegisterPage;



