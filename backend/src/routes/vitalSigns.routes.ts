import express from 'express';
import * as vitalSignsController from '../controllers/vitalSigns.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', vitalSignsController.getVitalSigns);
router.post('/', vitalSignsController.createVitalSigns);

export default router;
