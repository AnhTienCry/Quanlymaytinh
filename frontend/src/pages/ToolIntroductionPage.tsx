import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DownloadOutlined,
  CheckCircleOutlined,
  DesktopOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { agentApi } from '../services/api';
import { App } from 'antd';

export const ToolIntroductionPage: React.FC = () => {
  const { message } = App.useApp();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!agreed) {
      message.warning('Vui lòng đồng ý với điều khoản sử dụng trước khi tải xuống');
      return;
    }

    setIsDownloading(true);
    try {
      message.loading({ content: 'Đang tải công cụ...', key: 'download', duration: 0 });
      
      const response = await agentApi.download();
      
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'CongCuQuetThongTin.exe';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      message.success({ 
        content: 'Tải file thành công! Vui lòng mở file CongCuQuetThongTin.exe để quét thông tin. Sau khi quét xong, quay lại trang này để xem kết quả.', 
        key: 'download', 
        duration: 8 
      });
      
      // Chuyển đến trang hiển thị thông tin ngay (sẽ tự động refresh khi có dữ liệu)
      navigate('/my-computer');
      
    } catch (err) {
      console.error('Download error:', err);
      message.error({ 
        content: 'Lỗi tải file. Vui lòng thử lại.', 
        key: 'download', 
        duration: 5 
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <DesktopOutlined className="text-blue-400 text-xl" />
              <span className="text-xl font-bold text-white">Quản lý Máy tính</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300">Xin chào, {user?.username}</span>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Công cụ Quét Thông Tin Máy tính
          </h1>
          <p className="text-xl text-slate-400">
            Thu thập thông tin hệ thống một cách tự động và an toàn
          </p>
        </motion.div>

        <Card className="bg-slate-800/50 border-slate-700/50 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <ThunderboltOutlined className="text-blue-400" />
                Công cụ này làm gì?
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Công cụ quét thông tin máy tính sẽ tự động thu thập các thông tin sau từ máy tính của bạn:
              </p>
              <ul className="space-y-2 text-slate-300 list-disc list-inside ml-4">
                <li>Thông tin phần cứng: CPU, RAM, Ổ cứng, VGA</li>
                <li>Thông tin hệ thống: Tên máy, Hệ điều hành, Serial Number</li>
                <li>Thông tin mạng: MAC Address, IP Address</li>
                <li>Thông tin nhà sản xuất: Hãng, Model, Năm sản xuất</li>
              </ul>
            </div>

            <div className="border-t border-slate-700 pt-6 mt-6 bg-yellow-500/10 border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Lưu ý quan trọng:</h3>
              <p className="text-slate-300 leading-relaxed">
                Khi công cụ yêu cầu nhập <strong className="text-white">"Tên người dùng"</strong>, 
                vui lòng nhập chính xác <strong className="text-white">tên đăng nhập</strong> của bạn trên hệ thống này 
                (ví dụ: <code className="bg-slate-700 px-2 py-1 rounded">user123</code>).
                <br />
                Điều này giúp hệ thống liên kết thông tin máy tính với tài khoản của bạn.
              </p>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <SafetyOutlined className="text-green-400" />
                Bảo mật & Quyền riêng tư
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Công cụ này chỉ thu thập thông tin kỹ thuật của máy tính, không thu thập bất kỳ dữ liệu cá nhân nào. 
                Tất cả thông tin được mã hóa và lưu trữ an toàn. Chỉ bạn và quản trị viên hệ thống có thể xem thông tin của bạn.
              </p>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Cách sử dụng
              </h2>
              <ol className="space-y-3 text-slate-300 list-decimal list-inside ml-4">
                <li>Tải xuống và mở file <code className="bg-slate-700 px-2 py-1 rounded">CongCuQuetThongTin.exe</code></li>
                <li>Nhập tên của bạn khi được yêu cầu</li>
                <li>Chờ công cụ quét thông tin (thường mất vài giây)</li>
                <li>Nhấn Enter để hoàn tất</li>
                <li>Quay lại trang web để xem thông tin máy tính của bạn</li>
              </ol>
            </div>

            {/* Agreement Checkbox */}
            <div className="border-t border-slate-700 pt-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-slate-800 cursor-pointer"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  Tôi đã đọc và đồng ý với việc sử dụng công cụ này. Tôi hiểu rằng công cụ sẽ thu thập 
                  thông tin kỹ thuật của máy tính và gửi lên hệ thống để quản lý.
                </span>
              </label>
            </div>

            {/* Download Button */}
            <div className="pt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleDownload}
                loading={isDownloading}
                disabled={!agreed}
                icon={<DownloadOutlined />}
                className="w-full"
              >
                {isDownloading ? 'Đang tải xuống...' : 'Tải xuống Công cụ Quét'}
              </Button>
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-400 text-sm"
        >
          <p>Bạn đã có thông tin máy tính? <button onClick={() => navigate('/my-computer')} className="text-blue-400 hover:text-blue-300 underline">Xem ngay</button></p>
        </motion.div>
      </div>
    </div>
  );
};

export default ToolIntroductionPage;

