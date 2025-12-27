import { Router } from 'express';
import {
  getAllComputers,
  getComputerById,
  submitScanData,
  updateComputer,
  deleteComputer,
} from '../controllers/computer.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// POST /api/computers/scan - Nhận dữ liệu quét từ agent (User đã đăng nhập)
router.post('/scan', authenticateToken, submitScanData);

// GET /api/computers - Lấy danh sách máy tính (Admin)
router.get('/', authenticateToken, requireAdmin, getAllComputers);

// GET /api/computers/:id - Lấy thông tin 1 máy tính
router.get('/:id', authenticateToken, getComputerById);

// PUT /api/computers/:id - Cập nhật máy tính (Admin)
router.put('/:id', authenticateToken, requireAdmin, updateComputer);

// DELETE /api/computers/:id - Xóa máy tính (Admin)
router.delete('/:id', authenticateToken, requireAdmin, deleteComputer);

export default router;



