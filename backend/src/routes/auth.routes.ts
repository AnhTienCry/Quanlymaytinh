import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login - Đăng nhập
router.post('/login', login);

// POST /api/auth/register - Đăng ký
router.post('/register', register);

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', authenticateToken, getMe);

export default router;



