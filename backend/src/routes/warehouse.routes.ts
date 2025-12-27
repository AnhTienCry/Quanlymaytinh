import { Router } from 'express';
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouse.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET /api/warehouses - Lấy danh sách kho
router.get('/', authenticateToken, getAllWarehouses);

// POST /api/warehouses - Thêm kho (Admin)
router.post('/', authenticateToken, requireAdmin, createWarehouse);

// PUT /api/warehouses/:id - Cập nhật kho (Admin)
router.put('/:id', authenticateToken, requireAdmin, updateWarehouse);

// DELETE /api/warehouses/:id - Xóa kho (Admin)
router.delete('/:id', authenticateToken, requireAdmin, deleteWarehouse);

export default router;



