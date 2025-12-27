import { Router } from 'express';
import authRoutes from './auth.routes';
import computerRoutes from './computer.routes';
import dashboardRoutes from './dashboard.routes';
import warehouseRoutes from './warehouse.routes';
import agentRoutes from './agent.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/computers', computerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/agent', agentRoutes);

export default router;



