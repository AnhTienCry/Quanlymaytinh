import { Router } from 'express';
import { downloadAgentLauncher, getAgentInfo } from '../controllers/agent.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET /api/agent/info - Lấy thông tin về agent (Admin only)
router.get('/info', authenticateToken, requireAdmin, getAgentInfo);

// GET /api/agent/download - Tải file Agent Launcher (User đã login có thể tải)
// Không cần admin, chỉ cần đã đăng nhập
router.get('/download', authenticateToken, downloadAgentLauncher);

export default router;

