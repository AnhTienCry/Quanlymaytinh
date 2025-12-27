/**
 * Dashboard Page - Admin Overview
 * Refactored with useApi hook for better code organization
 */

import React, { useEffect } from 'react';
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
import { useApi } from '../hooks/useApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const DashboardPage: React.FC = () => {
  const message = useMessage();
  const { data: stats, loading, error, execute: fetchStats } = useApi<DashboardStats>();

  useEffect(() => {
    fetchStats(() => dashboardApi.getStats());
  }, [fetchStats]);

  // Show error message if API call failed
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Tổng quan hệ thống quản lý máy tính</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchStats(() => dashboardApi.getStats())}
            loading={loading}
            icon={<ReloadOutlined />}
            size="sm"
          >
            Làm mới
          </Button>
        </motion.div>

        {/* Stats Cards */}
        {loading && !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-24 bg-slate-700/50 rounded-xl" />
              </Card>
            ))}
          </div>
        ) : stats ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<DesktopOutlined />}
                label="Tổng máy tính"
                value={stats.totalComputers}
                color="blue"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<TeamOutlined />}
                label="Tổng người dùng"
                value={stats.totalUsers}
                color="teal"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<DatabaseOutlined />}
                label="Tổng kho"
                value={stats.totalWarehouses}
                color="purple"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<ClockCircleOutlined />}
                label="Quét gần đây"
                value={stats.recentScans.length}
                color="orange"
              />
            </motion.div>
          </motion.div>
        ) : null}

        {/* Recent Scans */}
        {stats && stats.recentScans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Quét gần đây</h2>
              <Table
                data={stats.recentScans}
                columns={recentScanColumns}
                emptyText="Chưa có dữ liệu quét"
              />
            </Card>
          </motion.div>
        )}

        {/* Computers by Status */}
        {stats && stats.computersByStatus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Máy tính theo trạng thái</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.computersByStatus.map((item, index) => (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-2xl font-bold text-white">{item.count}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};
