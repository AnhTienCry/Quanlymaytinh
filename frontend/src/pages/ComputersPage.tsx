import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DesktopOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../components/layouts';
import { Card, Button, Input, Table, Badge, Modal } from '../components/ui';
import { computerApi, Computer } from '../services/api';
import { useMessage } from '../hooks/useMessage';
import dayjs from 'dayjs';

export const ComputersPage: React.FC = () => {
  const message = useMessage();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [filteredComputers, setFilteredComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Computer>>({});

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const response = await computerApi.getAll();
      if (response.data.success && response.data.data) {
        setComputers(response.data.data);
        setFilteredComputers(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách máy tính');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComputers();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = computers.filter((pc) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        pc.TenMT?.toLowerCase().includes(searchLower) ||
        pc.MAC?.toLowerCase().includes(searchLower) ||
        pc.IPAddress?.toLowerCase().includes(searchLower) ||
        pc.TenNguoiDung?.toLowerCase().includes(searchLower) ||
        pc.CPU?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredComputers(filtered);
  }, [searchTerm, computers]);

  const handleView = (pc: Computer) => {
    setSelectedComputer(pc);
    setIsViewModalOpen(true);
  };

  const handleEdit = (pc: Computer) => {
    setSelectedComputer(pc);
    setEditForm({
      TenMT: pc.TenMT,
      TinhTrang: pc.TinhTrang,
      DeXuat: pc.DeXuat,
      TenNguoiDung: pc.TenNguoiDung,
      TrangThai: pc.TrangThai,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedComputer) return;

    try {
      const response = await computerApi.update(selectedComputer.MaMT, editForm);
      if (response.data.success) {
        message.success('Đã cập nhật thông tin');
        setIsEditModalOpen(false);
        fetchComputers();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật');
    }
  };

  const handleDelete = async (pc: Computer) => {
    if (!confirm(`Bạn có chắc muốn xóa máy tính "${pc.TenMT}"?`)) return;

    try {
      const response = await computerApi.delete(pc.MaMT);
      if (response.data.success) {
        message.success('Đã xóa máy tính');
        fetchComputers();
      }
    } catch (error) {
      message.error('Lỗi khi xóa');
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      'Đang sử dụng': 'success',
      'Trong kho': 'info',
      'Bảo trì': 'warning',
      'Thanh lý': 'danger',
    };
    return <Badge variant={statusMap[status || ''] || 'default'}>{status || 'N/A'}</Badge>;
  };

  const columns = [
    {
      key: 'TenMT',
      title: 'Tên máy',
      render: (value: unknown, record: Computer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <DesktopOutlined className="text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-white">{(value as string) || 'N/A'}</p>
            <p className="text-xs text-slate-400">{record.MAC}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'TenNguoiDung',
      title: 'Người dùng',
      render: (value: unknown) => (value as string) || '-',
    },
    {
      key: 'CPU',
      title: 'CPU',
      render: (value: unknown) => (
        <span className="text-xs">{(value as string) || 'N/A'}</span>
      ),
    },
    {
      key: 'RAM',
      title: 'RAM',
    },
    {
      key: 'TrangThai',
      title: 'Trạng thái',
      render: (value: unknown) => getStatusBadge(value as string),
    },
    {
      key: 'TinhTrang',
      title: 'Tình trạng',
      render: (value: unknown) => (value as string) || '-',
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_: unknown, record: Computer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(record)}
            className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
            title="Xem chi tiết"
          >
            <EyeOutlined />
          </button>
          <button
            onClick={() => handleEdit(record)}
            className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-colors"
            title="Sửa"
          >
            <EditOutlined />
          </button>
          <button
            onClick={() => handleDelete(record)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
            title="Xóa"
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold text-white">Quản lý Máy tính</h1>
            <p className="text-slate-400">
              Tổng cộng {computers.length} máy tính
            </p>
          </motion.div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchComputers}
              loading={loading}
              icon={<ReloadOutlined />}
              size="sm"
            >
              Làm mới
            </Button>
            <Button
              variant="secondary"
              icon={<FileExcelOutlined />}
              size="sm"
              onClick={() => message.info('Tính năng xuất Excel đang phát triển')}
            >
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            placeholder="Tìm kiếm theo tên, MAC, IP, người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<SearchOutlined />}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Table
            columns={columns}
            data={filteredComputers}
            loading={loading}
            rowKey="MaMT"
            emptyText="Chưa có máy tính nào"
          />
        </motion.div>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Chi tiết máy tính"
        size="lg"
      >
        {selectedComputer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tên máy" value={selectedComputer.TenMT} />
              <InfoItem label="MAC" value={selectedComputer.MAC} />
              <InfoItem label="IP" value={selectedComputer.IPAddress} />
              <InfoItem label="CPU" value={selectedComputer.CPU} />
              <InfoItem label="RAM" value={selectedComputer.RAM} />
              <InfoItem label="SSD" value={selectedComputer.SSD} />
              <InfoItem label="VGA" value={selectedComputer.VGA} />
              <InfoItem label="OS" value={selectedComputer.OS} />
              <InfoItem label="Người dùng" value={selectedComputer.TenNguoiDung} />
              <InfoItem label="Trạng thái" value={selectedComputer.TrangThai} />
              <InfoItem label="Tình trạng" value={selectedComputer.TinhTrang} />
              <InfoItem label="Đề xuất" value={selectedComputer.DeXuat} />
            </div>
            <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400">
              Cập nhật: {selectedComputer.NgayCapNhat ? dayjs(selectedComputer.NgayCapNhat).format('DD/MM/YYYY HH:mm') : 'N/A'}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa thông tin"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tên máy"
            value={editForm.TenMT || ''}
            onChange={(e) => setEditForm({ ...editForm, TenMT: e.target.value })}
          />
          <Input
            label="Người dùng"
            value={editForm.TenNguoiDung || ''}
            onChange={(e) => setEditForm({ ...editForm, TenNguoiDung: e.target.value })}
          />
          <Input
            label="Tình trạng"
            value={editForm.TinhTrang || ''}
            onChange={(e) => setEditForm({ ...editForm, TinhTrang: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Đề xuất
            </label>
            <textarea
              value={editForm.DeXuat || ''}
              onChange={(e) => setEditForm({ ...editForm, DeXuat: e.target.value })}
              className="input min-h-[100px] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trạng thái
            </label>
            <select
              value={editForm.TrangThai || ''}
              onChange={(e) => setEditForm({ ...editForm, TrangThai: e.target.value })}
              className="input"
            >
              <option value="Đang sử dụng">Đang sử dụng</option>
              <option value="Trong kho">Trong kho</option>
              <option value="Bảo trì">Bảo trì</option>
              <option value="Thanh lý">Thanh lý</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

const InfoItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-white">{value || 'N/A'}</p>
  </div>
);

export default ComputersPage;



