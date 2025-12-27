import { Router } from 'express';
import {
  getDashboardStats,
  getRecentUsers,
  getAllUsers,
} from '../controllers/dashboard.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Tất cả routes đều yêu cầu Admin
router.use(authenticateToken, requireAdmin);

// GET /api/dashboard/stats - Thống kê tổng quan
router.get('/stats', getDashboardStats);

// GET /api/dashboard/users - Danh sách users
router.get('/users', getAllUsers);

// GET /api/dashboard/recent-users - Users đăng nhập gần đây
router.get('/recent-users', getRecentUsers);

export default router;



