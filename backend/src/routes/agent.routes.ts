import { Router } from 'express';
import { downloadAgentLauncher, getAgentInfo } from '../controllers/agent.controller';

const router = Router();

// GET /api/agent/info - Lấy thông tin về agent
router.get('/info', getAgentInfo);

// GET /api/agent/download - Tải file Agent Launcher
router.get('/download', downloadAgentLauncher);

export default router;

