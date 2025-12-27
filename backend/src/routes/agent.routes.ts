import { Router } from 'express';
import { downloadAgentLauncher, getAgentInfo } from '../controllers/agent.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET /api/agent/info - Lấy thông tin về agent
router.get('/info', authenticateToken, requireAdmin, getAgentInfo);

// GET /api/agent/download - Tải file Agent Launcher
router.get('/download', authenticateToken, requireAdmin, downloadAgentLauncher);

export default router;

