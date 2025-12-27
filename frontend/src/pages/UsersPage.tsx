import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TeamOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { MainLayout } from '../components/layouts';
import { Card, Button, Input, Table, Badge } from '../components/ui';
import { dashboardApi, User } from '../services/api';
import { useMessage } from '../hooks/useMessage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const UsersPage: React.FC = () => {
  const message = useMessage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getUsers();
      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.Username?.toLowerCase().includes(searchLower) ||
        user.Role?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const columns = [
    {
      key: 'Username',
      title: 'Tên đăng nhập',
      render: (value: unknown, record: Record<string, unknown>) => {
        const user = record as unknown as User;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <UserOutlined className="text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{value as string}</p>
              <p className="text-xs text-slate-400 capitalize">{user.Role}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'Role',
      title: 'Vai trò',
      render: (value: unknown) => (
        <Badge variant={(value as string) === 'admin' ? 'danger' : 'info'}>
          {(value as string) === 'admin' ? 'Quản trị viên' : 'Người dùng'}
        </Badge>
      ),
    },
    {
      key: 'IsActive',
      title: 'Trạng thái',
      render: (value: unknown) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Hoạt động' : 'Khóa'}
        </Badge>
      ),
    },
    {
      key: 'LastLogin',
      title: 'Đăng nhập gần nhất',
      render: (value: unknown) =>
        value ? dayjs(value as string).fromNow() : 'Chưa đăng nhập',
    },
    {
      key: 'NgayTao',
      title: 'Ngày tạo',
      render: (value: unknown) =>
        value ? dayjs(value as string).format('DD/MM/YYYY') : 'N/A',
    },
    {
      key: 'ComputerCount',
      title: 'Số máy',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <DesktopOutlined className="text-slate-400" />
          <span>{(value as number) || 0}</span>
        </div>
      ),
    },
  ];

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.IsActive).length;
  const adminCount = users.filter((u) => u.Role === 'admin').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold text-white">Quản lý Người dùng</h1>
            <p className="text-slate-400">Danh sách tài khoản trong hệ thống</p>
          </motion.div>
          <Button
            variant="outline"
            onClick={fetchUsers}
            loading={loading}
            icon={<ReloadOutlined />}
            size="sm"
          >
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TeamOutlined className="text-2xl text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
              <p className="text-sm text-slate-400">Tổng người dùng</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <UserOutlined className="text-2xl text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeUsers}</p>
              <p className="text-sm text-slate-400">Đang hoạt động</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <UserOutlined className="text-2xl text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{adminCount}</p>
              <p className="text-sm text-slate-400">Quản trị viên</p>
            </div>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Input
            placeholder="Tìm kiếm theo tên đăng nhập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<SearchOutlined />}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Table
            columns={columns}
            data={filteredUsers as unknown as Record<string, unknown>[]}
            loading={loading}
            rowKey="UserId"
            emptyText="Chưa có người dùng nào"
          />
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UsersPage;



