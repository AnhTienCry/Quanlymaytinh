import { Router } from 'express';
import {
  getAllComputers,
  getComputerById,
  submitScanData,
  updateComputer,
  deleteComputer,
  getMyComputer,
  updateMyComputer,
} from '../controllers/computer.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// POST /api/computers/scan - Nhận dữ liệu quét từ agent (User đã đăng nhập)
router.post('/scan', authenticateToken, submitScanData);

// POST /api/computers/scan-direct - Nhận dữ liệu quét trực tiếp từ agent (Không cần auth)
router.post('/scan-direct', submitScanData);

// GET /api/computers/me - Lấy thông tin máy tính của user hiện tại
router.get('/me', authenticateToken, (req, res, next) => {
  console.log('🔄 GET /me route matched');
  next();
}, getMyComputer);

// PUT /api/computers/me - Cập nhật máy tính của user hiện tại (cho phép user update máy tính của mình)
router.put('/me', authenticateToken, updateMyComputer);

// GET /api/computers - Lấy danh sách máy tính (Admin)
router.get('/', authenticateToken, requireAdmin, getAllComputers);

// GET /api/computers/:id - Lấy thông tin 1 máy tính
router.get('/:id', authenticateToken, requireAdmin, getComputerById);

// PUT /api/computers/:id - Cập nhật máy tính (Admin)
router.put('/:id', authenticateToken, requireAdmin, updateComputer);

// DELETE /api/computers/:id - Xóa máy tính (Admin)
router.delete('/:id', authenticateToken, requireAdmin, deleteComputer);

export default router;



