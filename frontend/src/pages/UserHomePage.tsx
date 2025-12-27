import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScanOutlined,
  SendOutlined,
  DesktopOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ToolOutlined,
  LogoutOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Card, Button, Input } from '../components/ui';
import { useSystemInfo } from '../hooks/useSystemInfo';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useMessage } from '../hooks/useMessage';

export const UserHomePage: React.FC = () => {
  const message = useMessage();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    systemInfo,
    isScanning,
    isSending,
    agentStatus,
    scanSystem,
    sendToServer,
    clearInfo,
    checkAgent,
  } = useSystemInfo();

  // Các trường nhập tay
  const [tenNguoiDung, setTenNguoiDung] = useState('');
  const [tinhTrang, setTinhTrang] = useState('');
  const [deXuat, setDeXuat] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Kiểm tra agent khi load trang
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAgent();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendData = async () => {
    const success = await sendToServer({
      tenNguoiDung: tenNguoiDung || user?.username || 'Unknown',
      tinhTrang,
      deXuat,
    });

    if (success) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    clearInfo();
    setTenNguoiDung('');
    setTinhTrang('');
    setDeXuat('');
    setSubmitted(false);
  };

  // Xử lý khi bấm "Quét thông tin" - Tự động tải và chạy tool
  const handleScan = async () => {
    // Nếu agent chưa chạy, tự động tải và chạy tool
    if (agentStatus === 'offline' || agentStatus === 'unknown') {
      setIsDownloading(true);
      
      try {
        const apiUrl = api.defaults.baseURL || 'http://localhost:3000/api';
        const downloadUrl = `${apiUrl}/agent/download`;
        
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Không thể tải file');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'QuetThongTin.bat';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        message.success({
          content: 'Đã tải file! File sẽ tự động mở và chạy. Vui lòng đợi 5 giây...',
          duration: 5,
        });
        
        // Đợi 5 giây rồi tự động kiểm tra và quét
        setTimeout(() => {
          checkAgent().then((isOnline) => {
            if (isOnline) {
              setTimeout(() => {
                scanSystem();
              }, 1000);
            } else {
              // Nếu vẫn chưa online, thử lại sau 3 giây nữa
              setTimeout(() => {
                checkAgent().then((isOnline2) => {
                  if (isOnline2) {
                    scanSystem();
                  } else {
                    message.warning('Agent chưa khởi động. Vui lòng chạy file vừa tải thủ công.');
                  }
                });
              }, 3000);
            }
          });
        }, 5000);
        
      } catch (error) {
        message.error('Lỗi khi tải file tool');
        console.error(error);
      } finally {
        setIsDownloading(false);
      }
      
      return;
    }
    
    // Agent đã chạy, quét bình thường
    await scanSystem();
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <DesktopOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quản lý Máy tính</h1>
              <p className="text-slate-400">Xin chào, {user?.username}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} icon={<LogoutOutlined />}>
            Đăng xuất
          </Button>
        </motion.div>

        {/* Scan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ScanOutlined className="text-blue-400" />
                Quét thông tin máy tính
              </h2>
              {!submitted && (
                <Button
                  variant="primary"
                  onClick={handleScan}
                  loading={isScanning || isDownloading}
                  icon={<ScanOutlined />}
                  size="lg"
                >
                  {systemInfo ? 'Quét lại' : 'Quét thông tin'}
                </Button>
              )}
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircleOutlined className="text-4xl text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Đã gửi thành công!
                </h3>
                <p className="text-slate-400 mb-6">
                  Thông tin máy tính đã được lưu vào hệ thống
                </p>
                <Button variant="outline" onClick={handleReset}>
                  Quét lại
                </Button>
              </motion.div>
            ) : systemInfo ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* System Info Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Tên máy (Hostname)" value={systemInfo.hostname} />
                  <InfoRow label="Hãng sản xuất" value={systemInfo.manufacturer} />
                  <InfoRow label="Model" value={systemInfo.model} />
                  <InfoRow label="Năm SX" value={systemInfo.namSX?.toString()} />
                  <InfoRow label="CPU" value={systemInfo.cpu} highlight />
                  <InfoRow label="RAM" value={systemInfo.ram} highlight />
                  <InfoRow label="SSD/HDD" value={systemInfo.ssd} highlight />
                  <InfoRow label="VGA" value={systemInfo.vga} highlight />
                  <InfoRow label="MAC Address" value={systemInfo.mac} />
                  <InfoRow label="IP Address" value={systemInfo.ip} />
                  <InfoRow label="Hệ điều hành" value={systemInfo.os} />
                  <InfoRow label="Serial Number" value={systemInfo.serialNumber} />
                </div>

                {/* Manual Input Fields */}
                <div className="border-t border-slate-700/50 pt-6 space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2 mb-4">
                    <FileTextOutlined className="text-teal-400" />
                    Thông tin bổ sung (nhập tay)
                  </h3>

                  <Input
                    label="Tên người dùng"
                    placeholder="Nhập tên của bạn"
                    value={tenNguoiDung}
                    onChange={(e) => setTenNguoiDung(e.target.value)}
                    icon={<UserOutlined />}
                  />

                  <Input
                    label="Tình trạng máy"
                    placeholder="Ví dụ: Tốt, Hư bàn phím, Pin yếu..."
                    value={tinhTrang}
                    onChange={(e) => setTinhTrang(e.target.value)}
                    icon={<ToolOutlined />}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Đề xuất
                    </label>
                    <textarea
                      placeholder="Nhập đề xuất nâng cấp, sửa chữa... (nếu có)"
                      value={deXuat}
                      onChange={(e) => setDeXuat(e.target.value)}
                      className="input min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={handleReset}>
                    Hủy
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSendData}
                    loading={isSending}
                    icon={<SendOutlined />}
                    size="lg"
                  >
                    Gửi thông tin
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <DesktopOutlined className="text-4xl text-slate-500" />
                </div>
                {isDownloading ? (
                  <div className="space-y-2">
                    <LoadingOutlined className="text-4xl text-blue-400 animate-spin" />
                    <p className="text-slate-400">Đang tải và khởi động tool...</p>
                    <p className="text-sm text-blue-300">Vui lòng đợi vài giây</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-400">
                      Nhấn nút <strong className="text-blue-400">"Quét thông tin"</strong> để bắt đầu
                    </p>
                    <p className="text-sm text-slate-500">
                      Tool sẽ tự động tải và chạy cho bạn
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Info Row Component
interface InfoRowProps {
  label: string;
  value?: string;
  highlight?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-xl border ${
    highlight 
      ? 'bg-blue-500/10 border-blue-500/30' 
      : 'bg-slate-800/50 border-slate-700/50'
  }`}>
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className={`font-medium truncate ${highlight ? 'text-blue-300' : 'text-white'}`}>
      {value || 'N/A'}
    </p>
  </div>
);

export default UserHomePage;
