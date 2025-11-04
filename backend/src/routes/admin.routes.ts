import express from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/users', adminController.getAllUsers);
router.get('/stats', adminController.getSystemStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

export default router;
