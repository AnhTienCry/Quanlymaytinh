import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DesktopOutlined,
  EditOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Modal } from '../components/ui';
import { computerApi, Computer } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { App } from 'antd';

const InfoRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-slate-700/50 last:border-0">
    <span className="text-slate-400">{label}:</span>
    <span className="text-white font-medium">{value || 'N/A'}</span>
  </div>
);

export const MyComputerPage: React.FC = () => {
  const { message } = App.useApp();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [computer, setComputer] = useState<Computer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Computer>>({});
  const [hasScanned, setHasScanned] = useState(false);

  const fetchMyComputer = useCallback(async (showError = true) => {
    setLoading(true);
    try {
      const response = await computerApi.getMyComputer();
      if (response.data.success && response.data.data) {
        setComputer(response.data.data);
        setHasScanned(true);
        return true;
      }
      return false;
    } catch (error: any) {
      // 404 là trạng thái hợp lệ - chưa có dữ liệu, không phải lỗi
      // Không cần làm gì, chỉ set state và return
      if (error.response?.status === 404) {
        setHasScanned(false);
        setComputer(null);
        // Không log, không hiển thị error cho 404 - đây là trạng thái bình thường
        return false;
      }
      
      // Chỉ xử lý các lỗi thực sự (không phải 404)
      if (showError) {
        message.error('Không thể tải thông tin máy tính');
      }
      console.error('Error fetching computer:', error);
      setHasScanned(false);
      setComputer(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchMyComputer(false); // Không hiển thị lỗi lần đầu
  }, [fetchMyComputer]);

  // Auto-refresh mỗi 3 giây nếu chưa có dữ liệu (để detect khi user đã quét xong)
  useEffect(() => {
    if (!hasScanned && !loading) {
      const interval = setInterval(() => {
        fetchMyComputer(false); // Không hiển thị error khi auto-refresh
      }, 3000); // Check mỗi 3 giây để user thấy kết quả nhanh hơn

      return () => clearInterval(interval);
    }
  }, [hasScanned, loading, fetchMyComputer]);

  const handleUpdate = async () => {
    if (!computer) return;

    try {
      // Sử dụng updateMyComputer thay vì update (không cần admin)
      const response = await computerApi.updateMyComputer(editForm);
      if (response.data.success) {
        message.success('Đã cập nhật thông tin thành công');
        setIsEditModalOpen(false);
        fetchMyComputer(true);
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật');
      console.error('Update error:', error);
    }
  };

  const handleDownloadTool = async () => {
    try {
      message.loading({ content: 'Đang tải công cụ...', key: 'download', duration: 0 });
      
      const { agentApi } = await import('../services/api');
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
        content: 'Tải file thành công! Mở file để quét thông tin máy tính.', 
        key: 'download', 
        duration: 5 
      });
    } catch (err) {
      console.error('Download error:', err);
      message.error({ 
        content: 'Lỗi tải file. Vui lòng thử lại.', 
        key: 'download', 
        duration: 5 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!hasScanned || !computer) {
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
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
                <LogoutOutlined /> Đăng xuất
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="bg-slate-800/50 border-slate-700/50 text-center">
            <ExclamationCircleOutlined className="text-6xl text-yellow-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Chưa có thông tin máy tính
            </h2>
            <p className="text-slate-400 mb-8">
              Bạn cần tải và chạy công cụ quét để thu thập thông tin máy tính của bạn.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownloadTool}
              icon={<DownloadOutlined />}
            >
              Tải Công cụ Quét
            </Button>
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/tool-intro')}
              >
                Xem hướng dẫn
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <DesktopOutlined className="text-blue-400 text-xl" />
              <span className="text-xl font-bold text-white">Thông tin Máy tính của tôi</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => fetchMyComputer(true)} icon={<ReloadOutlined />}>
                Làm mới
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
                <LogoutOutlined /> Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-4">
              <CheckCircleOutlined className="text-green-400 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold text-white">Thông tin đã được cập nhật!</h3>
                <p className="text-slate-300">Máy tính của bạn đã được quét và lưu vào hệ thống.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Computer Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Thông tin Máy tính</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setEditForm({
                    TinhTrang: computer.TinhTrang || '',
                    DeXuat: computer.DeXuat || '',
                  });
                  setIsEditModalOpen(true);
                }}
                icon={<EditOutlined />}
              >
                Cập nhật
              </Button>
            </div>

            <div className="space-y-1">
              <InfoRow label="Tên máy" value={computer.TenMT} />
              {computer.Hang && <InfoRow label="Hãng" value={computer.Hang} />}
              {computer.Model && <InfoRow label="Model" value={computer.Model} />}
              {computer.NamSX && <InfoRow label="Năm sản xuất" value={computer.NamSX} />}
              {computer.CPU && <InfoRow label="CPU" value={computer.CPU} />}
              {computer.RAM && <InfoRow label="RAM" value={computer.RAM} />}
              {computer.SSD && <InfoRow label="Ổ cứng" value={computer.SSD} />}
              {computer.VGA && <InfoRow label="VGA" value={computer.VGA} />}
              {computer.MAC && <InfoRow label="MAC Address" value={computer.MAC} />}
              {computer.IPAddress && <InfoRow label="IP Address" value={computer.IPAddress} />}
              {computer.OS && <InfoRow label="Hệ điều hành" value={computer.OS} />}
              {computer.SerialNumber && <InfoRow label="Serial Number" value={computer.SerialNumber} />}
              {computer.TenNguoiDung && <InfoRow label="Người sử dụng" value={computer.TenNguoiDung} />}
              {computer.TrangThai && <InfoRow label="Trạng thái" value={computer.TrangThai} />}
            </div>
          </Card>
        </motion.div>

        {/* Action Card - Đề xuất */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <EditOutlined className="text-blue-400 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  💡 Bạn có muốn cập nhật hoặc đề xuất gì không?
                </h3>
                <p className="text-slate-300 mb-4">
                  Nếu máy tính của bạn có thay đổi, cần bảo trì, hoặc bạn muốn đề xuất nâng cấp,
                  vui lòng cập nhật thông tin bên dưới.
                </p>
                {computer.TinhTrang && (
                  <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
                    <div className="text-sm text-slate-400 mb-1">Tình trạng hiện tại:</div>
                    <div className="text-white">{computer.TinhTrang}</div>
                  </div>
                )}
                {computer.DeXuat && (
                  <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-slate-400 mb-1">Đề xuất:</div>
                    <div className="text-white">{computer.DeXuat}</div>
                  </div>
                )}
                <div className="flex gap-4 flex-wrap">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditForm({
                        TinhTrang: computer.TinhTrang || '',
                        DeXuat: computer.DeXuat || '',
                      });
                      setIsEditModalOpen(true);
                    }}
                    icon={<EditOutlined />}
                  >
                    {computer.TinhTrang || computer.DeXuat ? 'Cập nhật thông tin' : 'Thêm thông tin'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadTool}
                    icon={<DownloadOutlined />}
                  >
                    Quét lại
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Cập nhật thông tin"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tình trạng
            </label>
            <textarea
              value={editForm.TinhTrang || ''}
              onChange={(e) => setEditForm({ ...editForm, TinhTrang: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Tốt, Cần bảo trì, ..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Đề xuất
            </label>
            <textarea
              value={editForm.DeXuat || ''}
              onChange={(e) => setEditForm({ ...editForm, DeXuat: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Nên nâng cấp RAM, Cần thay ổ cứng, ..."
              rows={3}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="primary"
              onClick={handleUpdate}
              className="flex-1"
            >
              Lưu
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyComputerPage;

