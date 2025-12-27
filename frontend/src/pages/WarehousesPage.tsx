import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../components/layouts';
import { Card, Button, Input, Modal } from '../components/ui';
import { warehouseApi, Warehouse } from '../services/api';
import { useMessage } from '../hooks/useMessage';
import dayjs from 'dayjs';

export const WarehousesPage: React.FC = () => {
  const message = useMessage();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({
    TenKho: '',
    DiaChi: '',
    MoTa: '',
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await warehouseApi.getAll();
      if (response.data.success && response.data.data) {
        setWarehouses(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách kho');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setForm({
        TenKho: warehouse.TenKho || '',
        DiaChi: warehouse.DiaChi || '',
        MoTa: warehouse.MoTa || '',
      });
    } else {
      setEditingWarehouse(null);
      setForm({ TenKho: '', DiaChi: '', MoTa: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
    setForm({ TenKho: '', DiaChi: '', MoTa: '' });
  };

  const handleSubmit = async () => {
    if (!form.TenKho.trim()) {
      message.warning('Vui lòng nhập tên kho');
      return;
    }

    try {
      if (editingWarehouse) {
        const response = await warehouseApi.update(editingWarehouse.MaKho, form);
        if (response.data.success) {
          message.success('Đã cập nhật kho');
        }
      } else {
        const response = await warehouseApi.create(form);
        if (response.data.success) {
          message.success('Đã thêm kho mới');
        }
      }
      handleCloseModal();
      fetchWarehouses();
    } catch (error) {
      message.error('Lỗi khi lưu thông tin kho');
    }
  };

  const handleDelete = async (warehouse: Warehouse) => {
    if (!confirm(`Bạn có chắc muốn xóa kho "${warehouse.TenKho}"?`)) return;

    try {
      const response = await warehouseApi.delete(warehouse.MaKho);
      if (response.data.success) {
        message.success('Đã xóa kho');
        fetchWarehouses();
      }
    } catch (error) {
      message.error('Lỗi khi xóa kho');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold text-white">Quản lý Kho</h1>
            <p className="text-slate-400">
              Quản lý {warehouses.length} kho trong hệ thống
            </p>
          </motion.div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchWarehouses}
              loading={loading}
              icon={<ReloadOutlined />}
              size="sm"
            >
              Làm mới
            </Button>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              icon={<PlusOutlined />}
              size="sm"
            >
              Thêm kho
            </Button>
          </div>
        </div>

        {/* Warehouse Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 bg-slate-700/50 rounded w-2/3 mb-4" />
                <div className="h-4 bg-slate-700/50 rounded w-full mb-2" />
                <div className="h-4 bg-slate-700/50 rounded w-3/4" />
              </Card>
            ))
          ) : warehouses.length === 0 ? (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <DatabaseOutlined className="text-4xl text-slate-500 mb-4" />
                <p className="text-slate-400">Chưa có kho nào</p>
                <Button
                  variant="primary"
                  onClick={() => handleOpenModal()}
                  icon={<PlusOutlined />}
                  className="mt-4"
                >
                  Thêm kho đầu tiên
                </Button>
              </Card>
            </div>
          ) : (
            warehouses.map((warehouse, index) => (
              <motion.div
                key={warehouse.MaKho}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center">
                      <DatabaseOutlined className="text-xl text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(warehouse)}
                        className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                        title="Sửa"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDelete(warehouse)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Xóa"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {warehouse.TenKho}
                  </h3>

                  {warehouse.DiaChi && (
                    <div className="flex items-start gap-2 text-sm text-slate-400 mb-2">
                      <EnvironmentOutlined className="mt-0.5" />
                      <span>{warehouse.DiaChi}</span>
                    </div>
                  )}

                  {warehouse.MoTa && (
                    <p className="text-sm text-slate-500 mb-4">{warehouse.MoTa}</p>
                  )}

                  <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                    Cập nhật:{' '}
                    {warehouse.NgayCapNhat
                      ? dayjs(warehouse.NgayCapNhat).format('DD/MM/YYYY')
                      : 'N/A'}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWarehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tên kho *"
            placeholder="Nhập tên kho"
            value={form.TenKho}
            onChange={(e) => setForm({ ...form, TenKho: e.target.value })}
          />
          <Input
            label="Địa chỉ"
            placeholder="Nhập địa chỉ kho"
            value={form.DiaChi}
            onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mô tả
            </label>
            <textarea
              placeholder="Nhập mô tả về kho"
              value={form.MoTa}
              onChange={(e) => setForm({ ...form, MoTa: e.target.value })}
              className="input min-h-[100px] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingWarehouse ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default WarehousesPage;



