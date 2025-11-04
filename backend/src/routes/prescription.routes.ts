import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('doctor', 'nurse', 'patient'), (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
