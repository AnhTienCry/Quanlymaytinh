import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DesktopOutlined,
  TeamOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../components/layouts';
import { StatCard, Card, Table, Badge, Button } from '../components/ui';
import { dashboardApi, DashboardStats } from '../services/api';
import { useMessage } from '../hooks/useMessage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const DashboardPage: React.FC = () => {
  const message = useMessage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getStats();
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      'Đang sử dụng': 'success',
      'Trong kho': 'info',
      'Bảo trì': 'warning',
      'Thanh lý': 'danger',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };

  const recentScanColumns = [
    {
      key: 'TenMT',
      title: 'Tên máy',
      render: (value: unknown) => (value as string) || 'N/A',
    },
    {
      key: 'TenNguoiDung',
      title: 'Người dùng',
      render: (value: unknown) => (value as string) || 'N/A',
    },
    {
      key: 'IPAddress',
      title: 'IP',
      render: (value: unknown) => (value as string) || 'N/A',
    },
    {
      key: 'NgayQuet',
      title: 'Thời gian',
      render: (value: unknown) => value ? dayjs(value as string).fromNow() : 'N/A',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Tổng quan hệ thống quản lý máy tính</p>
          </motion.div>
          <Button
            variant="outline"
            onClick={fetchStats}
            loading={loading}
            icon={<ReloadOutlined />}
            size="sm"
          >
            Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<DesktopOutlined className="text-2xl" />}
            value={loading ? '...' : stats?.totalComputers || 0}
            label="Tổng máy tính"
            className="animate-fade-in stagger-1"
          />
          <StatCard
            icon={<TeamOutlined className="text-2xl" />}
            value={loading ? '...' : stats?.totalUsers || 0}
            label="Người dùng"
            className="animate-fade-in stagger-2"
          />
          <StatCard
            icon={<DatabaseOutlined className="text-2xl" />}
            value={loading ? '...' : stats?.totalWarehouses || 0}
            label="Kho"
            className="animate-fade-in stagger-3"
          />
          <StatCard
            icon={<ClockCircleOutlined className="text-2xl" />}
            value={loading ? '...' : stats?.recentScans?.length || 0}
            label="Quét gần đây"
            className="animate-fade-in stagger-4"
          />
        </motion.div>

        {/* Status Distribution */}
        {stats?.computersByStatus && stats.computersByStatus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">
                Phân bố theo trạng thái
              </h2>
              <div className="flex flex-wrap gap-4">
                {stats.computersByStatus.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50"
                  >
                    {getStatusBadge(item.status || 'Không xác định')}
                    <span className="text-white font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="none">
            <div className="p-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">
                Lịch sử quét gần đây
              </h2>
            </div>
            <Table
              columns={recentScanColumns}
              data={stats?.recentScans || []}
              loading={loading}
              rowKey="Id"
              emptyText="Chưa có lịch sử quét nào"
            />
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;



