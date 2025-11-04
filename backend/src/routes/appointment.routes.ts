import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', authorize('patient', 'doctor', 'nurse', 'admin'), (req, res) => {
  res.json({ success: true, message: 'Appointment created' });
});

export default router;
