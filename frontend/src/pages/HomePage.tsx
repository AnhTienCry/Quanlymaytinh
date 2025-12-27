import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DesktopOutlined, DatabaseOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button } from '../components/ui';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <DesktopOutlined className="text-blue-400 text-xl" />
              </div>
              <span className="text-xl font-bold text-white">Quản lý Máy tính</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Hệ thống Quản lý Máy tính
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Giải pháp quản lý thông tin máy tính một cách hiện đại, nhanh chóng và tiện lợi.
            Theo dõi và quản lý tài sản công nghệ thông tin của bạn một cách hiệu quả.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
              <DesktopOutlined className="text-blue-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Quét Thông Tin Tự Động</h3>
            <p className="text-slate-400 leading-relaxed">
              Công cụ quét tự động thu thập thông tin chi tiết về cấu hình phần cứng, 
              hệ điều hành và các thông tin quan trọng khác của máy tính.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-6">
              <DatabaseOutlined className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Quản Lý Tập Trung</h3>
            <p className="text-slate-400 leading-relaxed">
              Lưu trữ và quản lý toàn bộ thông tin máy tính tại một nơi, 
              dễ dàng tìm kiếm, cập nhật và theo dõi tình trạng sử dụng.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
              <SafetyOutlined className="text-purple-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Bảo Mật & An Toàn</h3>
            <p className="text-slate-400 leading-relaxed">
              Dữ liệu được bảo vệ an toàn với hệ thống xác thực và phân quyền, 
              đảm bảo chỉ những người được ủy quyền mới có thể truy cập.
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <Link to="/register">
            <Button variant="primary" size="lg" className="px-8 py-6 text-lg">
              Bắt đầu ngay
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

