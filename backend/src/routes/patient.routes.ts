import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('doctor', 'nurse', 'admin'), (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/:id', authorize('doctor', 'nurse', 'admin', 'patient'), (req, res) => {
  res.json({ success: true, data: {} });
});

router.put('/:id', authorize('doctor', 'nurse', 'admin', 'patient'), (req, res) => {
  res.json({ success: true, message: 'Patient updated' });
});

export default router;
