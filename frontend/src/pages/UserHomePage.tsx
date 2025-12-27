import React, { useState, useEffect } from 'react';
// Đã xóa import { motion } ...
import {
  ScanOutlined, SendOutlined, DesktopOutlined, CheckCircleOutlined,
  UserOutlined, FileTextOutlined, ToolOutlined, LogoutOutlined,
  LoadingOutlined, DownloadOutlined // Biến này giờ sẽ được dùng ở dưới
} from '@ant-design/icons';
import { Card, Button, Input, App } from 'antd';
import useSystemInfo from '../hooks/useSystemInfo';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { getBackendBaseUrl } from '../services/api';

export const UserHomePage: React.FC = () => {
  const { message } = App.useApp();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const { systemInfo, isScanning, isSending, agentStatus, scanSystem, sendToServer, clearInfo } 
    = useSystemInfo({ autoCheck: true });

  const [tenNguoiDung, setTenNguoiDung] = useState('');
  const [tinhTrang, setTinhTrang] = useState('');
  const [deXuat, setDeXuat] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);

  // Auto Scan khi thấy Tool online
  useEffect(() => {
    if (waitingForUser && agentStatus === 'online') {
      setWaitingForUser(false); 
      handleScanAction(); // Gọi hàm quét chính
    }
  }, [agentStatus, waitingForUser]);

  const handleScanAction = async () => {
    // 1. Nếu chưa có tool -> Tải về
    if (agentStatus === 'offline' || agentStatus === 'unknown') {
      try {
        // Sử dụng helper function để lấy đúng backend URL (hỗ trợ tunnel)
        const backendBaseUrl = getBackendBaseUrl();
        const downloadUrl = `${backendBaseUrl}/downloads/CongCuQuetThongTin.exe`;
        console.log('📥 Download URL:', downloadUrl);
        window.open(downloadUrl, '_self');
        setWaitingForUser(true);
        message.info({ content: 'Đang tải công cụ... Mở file lên để tự động quét!', duration: 5 });
      } catch (err) {
        console.error('Download error:', err);
        message.error('Lỗi tải file');
      }
      return;
    }
    
    // 2. Nếu có tool -> Quét & Tự động lưu
    const data = await scanSystem();
    if (data) {
      message.loading({ content: 'Đang lưu vào hệ thống...', key: 'saving' });
      
      const success = await sendToServer({
        ...data,
        tenNguoiDung: tenNguoiDung || user?.username || '',
        tinhTrang: tinhTrang,
        deXuat: deXuat
      });

      if (success) {
        message.success({ content: 'Đã cập nhật thành công!', key: 'saving' });
        setSubmitted(true);
      } else {
        message.error({ content: 'Lỗi khi lưu!', key: 'saving' });
      }
    }
  };

  const handleManualSend = async () => {
    if (!systemInfo) return;
    const success = await sendToServer({
      ...systemInfo,
      tenNguoiDung, tinhTrang, deXuat
    });
    if (success) {
      message.success('Cập nhật thông tin bổ sung thành công!');
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    clearInfo();
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-8">
          <div className="flex gap-4 items-center">
            <DesktopOutlined className="text-3xl text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Quản lý Máy tính</h1>
              <p className="text-slate-400">Xin chào, {user?.username}</p>
            </div>
          </div>
          <Button type="text" className="text-slate-300" onClick={() => { logout(); navigate('/login'); }} icon={<LogoutOutlined />}>Đăng xuất</Button>
        </div>

        <Card className="bg-slate-800 border-slate-700" bordered={false}>
          <div className="flex justify-between mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-semibold text-white"><ScanOutlined className="mr-2 text-blue-400" />Quét thông tin</h2>
            {!submitted && (
              <Button 
                type="primary" 
                onClick={handleScanAction} 
                loading={isScanning || isSending || waitingForUser} 
                className="bg-blue-600 h-10" 
                // Fix lỗi DownloadOutlined: Dùng icon này khi agent chưa online
                icon={waitingForUser ? <LoadingOutlined /> : (agentStatus === 'online' ? <ScanOutlined /> : <DownloadOutlined />)}
              >
                {waitingForUser ? 'Đang đợi mở file...' : (agentStatus === 'online' ? 'Quét & Lưu ngay' : 'Tải & Quét')}
              </Button>
            )}
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
              <h3 className="text-xl text-white font-bold">Thành công!</h3>
              <p className="text-slate-400 mb-6">Dữ liệu đã được lưu vào Dashboard.</p>
              <Button onClick={handleReset} className="text-white border-slate-600">Quét máy khác</Button>
            </div>
          ) : systemInfo ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Hostname" value={systemInfo.hostname} />
                <InfoRow label="CPU" value={systemInfo.cpu} highlight />
                <InfoRow label="RAM" value={systemInfo.ram} highlight />
                <InfoRow label="Ổ cứng" value={systemInfo.ssd} highlight />
                <InfoRow label="IP" value={systemInfo.ip} />
                <InfoRow label="OS" value={systemInfo.os} />
              </div>
              
              <div className="border-t border-slate-700 pt-4 space-y-4">
                <h3 className="text-white font-medium"><FileTextOutlined className="mr-2 text-teal-400"/>Bổ sung thông tin</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input prefix={<UserOutlined />} placeholder="Tên người dùng" value={tenNguoiDung} onChange={e => setTenNguoiDung(e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
                  <Input prefix={<ToolOutlined />} placeholder="Tình trạng" value={tinhTrang} onChange={e => setTinhTrang(e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
                </div>
                <Input.TextArea placeholder="Ghi chú/Đề xuất..." value={deXuat} onChange={e => setDeXuat(e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
                <div className="text-right">
                  <Button type="primary" onClick={handleManualSend} loading={isSending} icon={<SendOutlined />} className="bg-teal-600">Cập nhật bổ sung</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              {waitingForUser ? <p className="animate-pulse text-yellow-500">Đang đợi kết nối...</p> : <p>Chưa có thông tin. Nhấn nút quét để bắt đầu.</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, highlight }: any) => (
  <div className={`p-3 rounded border ${highlight ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
    <p className="text-xs text-slate-400">{label}</p>
    <p className={`font-medium truncate ${highlight ? 'text-blue-300' : 'text-white'}`}>{value || 'N/A'}</p>
  </div>
);

export default UserHomePage;